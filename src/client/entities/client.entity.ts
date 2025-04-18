import {
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/entities/account.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';

@Entity('client')
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => AccountEntity, (account) => account.client)
  accounts?: AccountEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.client)
  transaction?: TransactionEntity[];
}
