import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '../../account/entities/account.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { Role } from '../../auth/role.enum';

@Entity('client')
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => AccountEntity, (account) => account.client)
  accounts?: AccountEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.client)
  transaction?: TransactionEntity[];

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  roles: Role;
}
