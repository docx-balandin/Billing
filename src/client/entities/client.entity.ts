import {
  Column,
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
}

// добавить поле емайл и пароль, сделать метод для регистрации
// сделать метод по авторизации, этот метод должен возвращать один json web token 'jwt'
// сделать метод для возврата емайл при запросе
// почитать про практики хранение паролей в базе даных
// паспорт.js не используем
