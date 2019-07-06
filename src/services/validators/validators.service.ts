import { Injectable } from '@nestjs/common';
import { map, catchError } from 'rxjs/operators';
import { range, BehaviorSubject, of } from 'rxjs';
import { FetchService } from '../http/fetch.service';
import { RedisService } from '../redis/redis.service';
import Queue from 'bull';

@Injectable()
export class ValidatorsService {
  validatorsStore = [];
  validatorsStore$ = new BehaviorSubject([]);
  
  public getValidatorsStore$() { return this.validatorsStore$ }

  constructor(
    private fetchService: FetchService,
    private redisService: RedisService
  ) { 
    console.log("VALIDATORS SERVICE STARTED!");

    let validatorsServiceQueue = new Queue('Validators Service Que');

    validatorsServiceQueue.process(function(job){
      job;
      console.log('VALIDATORS SERVICE WAS RESCHEDULED!');
    });  

    validatorsServiceQueue.add(
      this.initValidators(), 
      {repeat: {cron: '*/5 * * * *'}}
    );

    this.getValidatorsStore$().subscribe((newValidators: any[]) => {
      if(newValidators.length > 0) {
        // console.log(newValidators);
        this.setValidatorsBlob(newValidators); 
      }
    });
  }

  public getValidatorsBlob() {
    return this.redisService.getRedisInstance().get("validators_blob");
  }

  public setValidatorsBlob(validators: any) {
    return this.redisService.getRedisInstance().set("validators_blob", JSON.stringify(validators));
  }

  private async precacheAddresses() {
    return new Promise ((resolve) => {

      this.getStakingValidators()
        .then( (validators:any[]) => {
          let addresses = [];
          for(let validator of validators) {
            addresses.push(validator.operator_address);
          }
          return addresses;
        })
        .then((addresses:any) => {
          this.redisService.getRedisInstance()
            .multi()
            .sadd('temporary_set', addresses)
            .sadd('validators_set', addresses)
            .sdiff('validators_set', 'temporary_set')
            .del('temporary_set')
            .exec( (error, results) => {
                if(error) {
                  // console.log(error);
                } else {
                  // console.log(results);
                  resolve(results[2][1]);
                }
              });
        })
        .catch(function (error) {
          // console.log(error);
        });
    });
  }


  private async initValidators() { 
    let result = <[]>(await this.precacheAddresses());
    console.log(`UPDATING VALIDATORS STATE! *** ${new Date()} ***`);

    for(let address of result) {
      let currentValidator = await this.getStakingValidator(address)
      if(currentValidator) {
        this.validatorsStore.push(currentValidator);
      }
    }
    // console.log(this.validatorsStore, this.validatorsStore.length);
    
    for(let validator of this.validatorsStore) {
      this.getValidatorSignInfo(validator);
      this.getValidatorOutstandingRewards(validator);
      this.getValidatorRewards(validator);
      this.getValidatorUnbondDelegations(validator);
    }

    let validatorsPromises = [];

    for (let i = 0; i < this.validatorsStore.length; i++) {
      validatorsPromises.push(this.getValidatorDistribution(this.validatorsStore[i]));
    }

    Promise.all(validatorsPromises).then(()=> {
      this.triggerDelegations()
    });
  }


  public getStakingValidators() {
    return new Promise(resolve => {
      this.fetchService.getHttpClient()
        .get(`/staking/validators`)
        .pipe( map(res => res.data))
        .subscribe(async (data:any) => {
        // TODO remove debugging
        // console.log( data );
        if (data !== null) {
          this.validatorsStore = data;
          resolve(data);
        }
      });
    });
  }


  public getStakingValidator(address) {
    return new Promise(resolve => {
      this.fetchService.getHttpClient()
        .get(`/staking/validators/${address}`)
        .pipe( 
          map(res => res.data),
          catchError((error) => 
            of(null)
          )
        )
        .subscribe(async (data:any) => {
          // TODO remove debugging
          // console.log( data );
          resolve(data);
      });
    });
  }


  public getValidatorSignInfo(validator) {
    return new Promise(resolve => {
      this.fetchService.getHttpClient().get(`/slashing/validators/${validator.consensus_pubkey}/signing_info`).pipe( map(res => res.data))
        .subscribe(data => {
          // TODO remove debugging
          // console.log(data);
          validator.signing_info = data;
          resolve();
        });
    });
  }

  public getValidatorDistribution(validator:any) {
    return new Promise(resolve => {
      this.fetchService.getHttpClient().get(`/distribution/validators/${validator.operator_address}`).pipe( map(res => res.data))
        .subscribe(
          (data:any) => {
            // TODO remove debugging
            // console.log(data);
            if(data) {
              validator.distribution = data;
            } else {
              validator.distribution = {
                operator_address: null
              }
              resolve(); 
            }
            this.fetchService.getHttpClient().get(`/auth/accounts/${data.operator_address}`).pipe( map(res => res.data))
              .subscribe((data) => {
                validator.account = data;
                resolve();
              });
          },
          (error) => {
            // TODO remove debugging
            // console.log(error);
            validator.distribution = {
              operator_address: null
            };
            validator.account = { tokens: 0 };
            resolve();
          }
        );
    });
  }
  
  // TODO @aakatev 
  // Seems like rewards and outstanding rewards are messed up in rpc
  // Keep an eye to see if they fix it
  public getValidatorRewards(validator) {
    return new Promise(resolve => {
      this.fetchService.getHttpClient().get(`/distribution/validators/${validator.operator_address}/rewards`).pipe( map(res => res.data))
        .subscribe(
          (data) => {
            // TODO remove debugging
            // console.log(data);
            validator.outstandning_rewards = data;
            resolve();
          },
          (error) => {
            // TODO remove debugging
            // console.log(error);
            validator.outstandning_rewards = null;
            resolve();
          }
        );
    });
  }

  public getValidatorOutstandingRewards(validator) {
    return new Promise(resolve => {
      this.fetchService.getHttpClient().get(`/distribution/validators/${validator.operator_address}/outstanding_rewards`).pipe( map(res => res.data))
        .subscribe(
          (data) => {
            // TODO remove debugging
            // console.log(data);
            validator.rewards = data;
            resolve();
          },
          (error) => {
            // TODO remove debugging
            // console.log(error);
            validator.rewards = null;
            resolve();
          }
        );
    });
  }

  public getValidatorUnbondDelegations(validator) {
    validator.unbonding_total = 0;
    return new Promise(resolve => {
      this.fetchService.getHttpClient().get(`/staking/validators/${validator.operator_address}/unbonding_delegations`).pipe( map(res => res.data))
        .subscribe(data => {
          // TODO remove debugging
          // console.log(data);
          validator.unbonding_delegations = data;
          if(data) {
            (<any[]>data).forEach(delegation => {
              (<any[]>delegation.entries).forEach(entry => {
                // TODO remove debugging
                // console.log(parseInt(entry.balance));
                validator.unbonding_total += parseInt(entry.balance, 10);
              })
            });
          }
          resolve();
        });
    });
  }

  public triggerDelegations() {
    let validatorsPromises = [];

    for (let i = 0; i < this.validatorsStore.length; i++) {
      validatorsPromises.push( this.initDelegations( this.validatorsStore[i]) ) ;
    }

    Promise.all(validatorsPromises).then(()=> {
      this.validatorsStore$.next(
        this.validatorsStore
      );
    });
  };

  public initDelegations(validator) {
    return new Promise (resolve => {
      this.getValidatorDelegations(validator.operator_address)
      .subscribe((data: any) => {
        // console.log(data);
        validator.delegations = data;
      },
      (error) => {
        // console.log(error);
        validator.delegations = [];
        resolve();
      },
      () => {  
        this.calculateSelfBond(validator);
        // TODO look again
        // Might be buggy
        resolve();
      });
    });
  }

  private calculateSelfBond(validator) {
    let delegations = validator.delegations;
    validator.self_bond = 0;

    const count$ = range(0, delegations.length);

    count$.subscribe((count) => {
      if(delegations[count].delegator_address === validator.distribution.operator_address) {
        validator.self_bond += Number(delegations[count].shares);
      }
    },
    (error) => {
      // console.log(error);
    },
    () => { });
  }

  public getValidatorDelegations(address) {
    return this.fetchService
                .getHttpClient()
                .get(`/staking/validators/${address}/delegations`)
                .pipe(map(res => res.data));
  }
}