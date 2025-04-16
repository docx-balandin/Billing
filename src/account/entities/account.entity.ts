import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientEntity } from '../../client/entities/client.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  balance: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => TransactionEntity, (tx) => tx.fromAccount)
  transactionsFrom?: TransactionEntity[];

  @OneToMany(() => TransactionEntity, (tx) => tx.toAccount)
  transactionsTo?: TransactionEntity[];

  @ManyToOne(() => ClientEntity, (client) => client.accounts)
  client?: ClientEntity;
}
