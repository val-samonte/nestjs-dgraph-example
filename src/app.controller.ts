import { Get, Controller } from '@nestjs/common';
import { DgraphService } from '@valsamonte/nestjs-dgraph';
import { Operation, Mutation } from 'dgraph-js';

@Controller()
export class AppController {
  constructor(
    private readonly dgraphService: DgraphService,
  ) { }

  @Get()
  async root(): Promise<string> {
    await this.dropAll();
    await this.setSchema();
    await this.createData();
    return await this.queryData();
  }

  async dropAll() {
    const op = new Operation();
    op.setDropAll(true);
    await this.dgraphService.client.alter(op);
  }

  async setSchema() {
    const schema = `
      name: string @index(exact) .
      age: int .
      married: bool .
      loc: geo .
      dob: datetime .
    `;
    const op = new Operation();
    op.setSchema(schema);
    await this.dgraphService.client.alter(op);
  }

  async createData() {
    const txn = this.dgraphService.client.newTxn();
    try {
      const p = {
        name: 'Alessa',
        age: 26,
        married: true,
        loc: {
          type: 'Point',
          coordinates: [1.1, 2],
        },
        dob: new Date(1980, 1, 1, 23, 0, 0, 0),
        friend: [
          {
            name: 'Bob',
            age: 24,
          },
          {
            name: 'Charlie the unicorn',
            age: 29,
          },
        ],
        school: [
          {
            name: 'Midwich Elementary School',
          },
        ],
      };
      const mu = new Mutation();
      mu.setSetJson(p);
      await txn.mutate(mu);
      await txn.commit();
    } finally {
      await txn.discard();
    }
  }

  async queryData() {
    const query = `
      query all($a: string) {
        all(func: eq(name, $a)) {
          uid
          name
          age
          married
          loc
          dob
          friend {
            name
            age
          }
          school {
            name
          }
        }
      }`;
    const vars = { $a: 'Alessa' };
    const res = await this.dgraphService.client.newTxn().queryWithVars(query, vars);
    const ppl = res.getJson();

    return ppl;
  }
}
