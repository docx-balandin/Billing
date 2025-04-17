import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/entities/account.entity';

export enum TransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  P2TRANSFER = 'p2transfer',
}

export enum TransactionStatusEnum {
  SUCCESS = 'success',
  PROCESSING = 'processing',
  REJECT = 'reject',
}

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: TransactionTypeEnum })
  type: TransactionTypeEnum;

  @ManyToOne(() => AccountEntity, (account) => account.transactionsFrom, {
    nullable: true,
  })
  fromAccount?: AccountEntity;

  @ManyToOne(() => AccountEntity, (account) => account.transactionsTo, {
    nullable: true,
  })
  toAccount?: AccountEntity;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.SUCCESS,
  })
  status: TransactionStatusEnum;
}
