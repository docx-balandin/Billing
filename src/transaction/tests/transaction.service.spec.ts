import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from '../transaction.service';
import {
  TransactionEntity,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '../entities/transaction.entity';
import { AccountService } from '../../account/account.service';
import { AccountEntity } from '../../account/entities/account.entity';
import { ClientEntity } from '../../client/entities/client.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MakeDepositDto } from '../dto/create-transaction.dto';

describe('TransactionService', () => {
  let mockFindBy: jest.Mock;
  let mockFind: jest.Mock;
  let mockSave: jest.Mock;
  let mockExistsAccount: jest.Mock;
  let mockActiveAccount: jest.Mock;
  let mockUpdateBalance: jest.Mock;
  let mockNegativeBalance: jest.Mock;
  let mockIsSameClientAccounts: jest.Mock;

  let service: TransactionService;
  let accountService: AccountService;

  beforeEach(async () => {
    mockFindBy = jest.fn();
    mockFind = jest.fn();
    mockSave = jest.fn();
    mockExistsAccount = jest.fn();
    mockActiveAccount = jest.fn();
    mockUpdateBalance = jest.fn();
    mockNegativeBalance = jest.fn();
    mockIsSameClientAccounts = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: {
            findBy: mockFindBy,
            find: mockFind,
            save: mockSave,
          },
        },
        {
          provide: AccountService,
          useValue: {
            existsAccount: mockExistsAccount,
            activeAccount: mockActiveAccount,
            updateBalance: mockUpdateBalance,
            negativeBalance: mockNegativeBalance,
            isSameClientAccounts: mockIsSameClientAccounts,
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    accountService = module.get<AccountService>(AccountService);
  });

  describe('should be defined', () => {
    it('should be service defined', () => {
      expect(service).toBeDefined();
    });

    it('should be accountService defined', () => {
      expect(accountService).toBeDefined();
    });
  });

  describe('findAllTransactionForAdmin', () => {
    let fakeTransaction: TransactionEntity;
    let order: Record<string, string>;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.TRANSFER,
        fromAccount: { id: 1 } as AccountEntity,
        toAccount: { id: 2 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };

      order = { type: 'ASC' };

      mockFind.mockResolvedValue(fakeTransaction);
    });

    it('should return all transactions', async () => {
      const result = await service.findAllTransactionForAdmin(order);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call find with correct args', async () => {
      await service.findAllTransactionForAdmin(order);

      expect(mockFind).toHaveBeenCalledWith({
        where: {},
        order: order,
      });
    });
  });

  describe('allTransactions', () => {
    let fakeTransaction: TransactionEntity;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.TRANSFER,
        fromAccount: { id: 1 } as AccountEntity,
        toAccount: { id: 2 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };
      mockFindBy.mockResolvedValue([fakeTransaction]);
    });

    it('should return all transactions for a client', async () => {
      const result = await service.findAllTransactions(1);

      expect(result).toEqual([fakeTransaction]);
    });

    it('should call findBy with correct args', async () => {
      await service.findAllTransactions(1);

      expect(mockFindBy).toHaveBeenCalledWith({
        client: { id: 1 },
      });
    });
  });

  describe('accountAllTransactions', () => {
    let fakeTransaction: TransactionEntity[];

    beforeEach(() => {
      fakeTransaction = [
        {
          id: 1,
          amount: '100',
          createdAt: new Date('2025-04-30 08:40:43.688'),
          type: TransactionTypeEnum.TRANSFER,
          fromAccount: { id: 1 } as AccountEntity,
          toAccount: { id: 2 } as AccountEntity,
          status: TransactionStatusEnum.SUCCESS,
          client: { id: 1 } as ClientEntity,
        },
        {
          id: 2,
          amount: '100',
          createdAt: new Date('2025-04-30 08:40:43.688'),
          type: TransactionTypeEnum.TRANSFER,
          fromAccount: { id: 2 } as AccountEntity,
          toAccount: { id: 1 } as AccountEntity,
          status: TransactionStatusEnum.SUCCESS,
          client: { id: 1 } as ClientEntity,
        },
      ];
      mockFind.mockResolvedValue(fakeTransaction);
    });

    it('should return all transactions for an account', async () => {
      const result = await service.findAccountAllTransactions(1, 1);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call find with correct args', async () => {
      await service.findAccountAllTransactions(1, 1);

      expect(mockFind).toHaveBeenCalledWith({
        where: [
          { client: { id: 1 }, toAccount: { id: 1 } },
          { client: { id: 1 }, fromAccount: { id: 1 } },
        ],
      });
    });

    it('should return error if account not found', () => {
      mockFind.mockResolvedValue([]);

      expect(async () => {
        await service.findAccountAllTransactions(1, 3);
      }).rejects.toThrow('Account Not Found');
    });
  });

  describe('makeDeposit', () => {
    let fakeTransaction: TransactionEntity;

    let fakeTransactionDto: MakeDepositDto;

    let fakeAccount: AccountEntity;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.DEPOSIT,
        fromAccount: undefined,
        toAccount: { id: 1 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };

      fakeTransactionDto = {
        amount: '100',
      };

      fakeAccount = {
        id: 1,
        name: 'FAKE',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        balance: '100',
        isActive: true,
        client: { id: 1 } as ClientEntity,
      };

      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
      mockUpdateBalance.mockResolvedValue(fakeAccount);
      mockSave.mockResolvedValue(fakeTransaction);
    });

    it('should call exists account with correct args', async () => {
      await service.makeDeposit(1, 1, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should return error if account 3 not found', () => {
      mockExistsAccount.mockRejectedValue(
        new NotFoundException('Account 3 not found'),
      );

      expect(async () => {
        await service.makeDeposit(1, 3, fakeTransactionDto);
      }).rejects.toThrow('Account 3 not found');
    });

    it('should call active account with correct args', async () => {
      await service.makeDeposit(1, 1, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should return error if account blocked', () => {
      mockActiveAccount.mockRejectedValue(
        new BadRequestException('Operation impossible! Account 1 blocked!'),
      );

      expect(async () => {
        await service.makeDeposit(1, 1, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Account 1 blocked!');
    });

    it('should call update balance with correct args', async () => {
      await service.makeDeposit(1, 1, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        1,
        1,
        fakeTransactionDto.amount,
      );
    });

    it('should return deposit for account', async () => {
      const result = await service.makeDeposit(1, 1, fakeTransactionDto);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeDeposit(1, 1, fakeTransactionDto);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransactionDto,
        toAccount: { id: 1 },
        status: 'success',
        type: 'DEPOSIT',
        client: { id: 1 },
      });
    });
  });

  describe('makeWithdraw', () => {
    let fakeTransaction: TransactionEntity;

    let fakeTransactionDto: MakeDepositDto;

    let fakeAccount: AccountEntity;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.WITHDRAW,
        fromAccount: undefined,
        toAccount: { id: 1 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };

      fakeTransactionDto = {
        amount: '100',
      };

      fakeAccount = {
        id: 1,
        name: 'FAKE',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        balance: '100',
        isActive: true,
        client: { id: 1 } as ClientEntity,
      };

      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
      mockNegativeBalance.mockResolvedValue(true);
      mockUpdateBalance.mockResolvedValue(fakeAccount);
      mockSave.mockResolvedValue(fakeTransaction);
    });

    it('should call exists account with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should return error if account 3 not found', () => {
      mockExistsAccount.mockRejectedValue(
        new NotFoundException('Account 3 not found'),
      );

      expect(async () => {
        await service.makeWithdraw(1, 3, fakeTransactionDto);
      }).rejects.toThrow('Account 3 not found');
    });

    it('should call active account with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should return error if account blocked', () => {
      mockActiveAccount.mockRejectedValue(
        new BadRequestException('Operation impossible! Account 1 blocked!'),
      );

      expect(async () => {
        await service.makeWithdraw(1, 1, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Account 1 blocked!');
    });

    it('should call negative balance with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(mockNegativeBalance).toHaveBeenCalledWith(1, '100');
    });

    it('should return error if negative balance', () => {
      mockNegativeBalance.mockRejectedValue(
        new BadRequestException(
          'Operation impossible! Negative account 1 balance',
        ),
      );

      expect(async () => {
        await service.makeWithdraw(1, 1, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Negative account 1 balance');
    });

    it('should call update balance with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        1,
        1,
        '-' + fakeTransactionDto.amount,
      );
    });

    it('should return withdraw for account', async () => {
      const result = await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransactionDto);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransactionDto,
        toAccount: { id: 1 },
        status: 'success',
        type: 'withdraw',
        client: { id: 1 },
      });
    });
  });

  describe('makeTransfer', () => {
    let fakeTransaction: TransactionEntity;

    let fakeTransactionDto: MakeDepositDto;

    let fakeAccount: AccountEntity;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.TRANSFER,
        fromAccount: { id: 2 } as AccountEntity,
        toAccount: { id: 1 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };

      fakeTransactionDto = {
        amount: '100',
      };

      fakeAccount = {
        id: 1,
        name: 'FAKE',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        balance: '100',
        isActive: true,
        client: { id: 1 } as ClientEntity,
      };

      mockIsSameClientAccounts.mockResolvedValue(true);
      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
      mockNegativeBalance.mockResolvedValue(true);
      mockUpdateBalance.mockResolvedValue(fakeAccount);
      mockSave.mockResolvedValue(fakeTransaction);
    });

    it('should call is same client accounts with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockIsSameClientAccounts).toHaveBeenCalledWith(1, 2, 1);
    });

    it('should return error if accounts do not belong to the same client', () => {
      mockIsSameClientAccounts.mockResolvedValue(false);

      expect(async () => {
        await service.makeTransfer(1, 2, 1, fakeTransactionDto);
      }).rejects.toThrow('The accounts do not belong to the same client');
    });

    it('should call exists account with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 2);
    });

    it('should call exists account with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should return error if account 3 not found', () => {
      mockExistsAccount.mockRejectedValue(
        new NotFoundException('Account 3 not found'),
      );

      expect(async () => {
        await service.makeTransfer(1, 3, 3, fakeTransactionDto);
      }).rejects.toThrow('Account 3 not found');
    });

    it('should call active account with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(2);
    });

    it('should call active account with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should return error if account blocked', () => {
      mockActiveAccount.mockRejectedValue(
        new BadRequestException('Operation impossible! Account 2 blocked!'),
      );

      expect(async () => {
        await service.makeTransfer(1, 2, 1, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Account 2 blocked!');
    });

    it('should call negative balance with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockNegativeBalance).toHaveBeenCalledWith(2, '100');
    });

    it('should return error if negative balance', () => {
      mockNegativeBalance.mockRejectedValue(
        new BadRequestException(
          'Operation impossible! Negative account 2 balance',
        ),
      );

      expect(async () => {
        await service.makeTransfer(1, 2, 1, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Negative account 2 balance');
    });

    it('should call update balance with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        1,
        2,
        '-' + fakeTransactionDto.amount,
      );
    });

    it('should call update balance with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        1,
        1,
        fakeTransactionDto.amount,
      );
    });

    it('should return transfer for account', async () => {
      const result = await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeTransfer(1, 2, 1, fakeTransactionDto);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransactionDto,
        fromAccount: { id: 2 },
        toAccount: { id: 1 },
        status: 'success',
        type: 'transfer',
        client: { id: 1 },
      });
    });
  });

  describe('makeP2Transfer', () => {
    let fakeTransaction: TransactionEntity;

    let fakeTransactionDto: MakeDepositDto;

    let fakeAccount: AccountEntity;

    beforeEach(() => {
      fakeTransaction = {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: TransactionTypeEnum.P2TRANSFER,
        fromAccount: { id: 1 } as AccountEntity,
        toAccount: { id: 2 } as AccountEntity,
        status: TransactionStatusEnum.SUCCESS,
        client: { id: 1 } as ClientEntity,
      };

      fakeTransactionDto = {
        amount: '100',
      };

      fakeAccount = {
        id: 1,
        name: 'FAKE',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        balance: '100',
        isActive: true,
        client: { id: 1 } as ClientEntity,
      };

      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
      mockNegativeBalance.mockResolvedValue(true);
      mockUpdateBalance.mockResolvedValue(fakeAccount);
      mockSave.mockResolvedValue(fakeTransaction);
    });

    it('should call exists account with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should call exists account with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockExistsAccount).toHaveBeenCalledWith(2, 2);
    });

    it('should return error if account 3 not found', () => {
      mockExistsAccount.mockRejectedValue(
        new NotFoundException('Account 3 not found'),
      );

      expect(async () => {
        await service.makeP2Transfer(1, 2, 3, 3, fakeTransactionDto);
      }).rejects.toThrow('Account 3 not found');
    });

    it('should call active account with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should call active account with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockActiveAccount).toHaveBeenCalledWith(2);
    });

    it('should return error if account blocked', () => {
      mockActiveAccount.mockRejectedValue(
        new BadRequestException('Operation impossible! Account 2 blocked!'),
      );

      expect(async () => {
        await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Account 2 blocked!');
    });

    it('should call negative balance with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockNegativeBalance).toHaveBeenCalledWith(1, '100');
    });

    it('should return error if negative balance', () => {
      mockNegativeBalance.mockRejectedValue(
        new BadRequestException(
          'Operation impossible! Negative account 1 balance',
        ),
      );

      expect(async () => {
        await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);
      }).rejects.toThrow('Operation impossible! Negative account 1 balance');
    });

    it('should call update balance with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        1,
        1,
        '-' + fakeTransactionDto.amount,
      );
    });

    it('should call update balance with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        2,
        2,
        fakeTransactionDto.amount,
      );
    });

    it('should return p2transfer for account', async () => {
      const result = await service.makeP2Transfer(
        1,
        2,
        1,
        2,
        fakeTransactionDto,
      );

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeP2Transfer(1, 2, 1, 2, fakeTransactionDto);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransactionDto,
        fromAccount: { id: 1 },
        toAccount: { id: 2 },
        status: 'success',
        type: 'p2transfer',
        client: { id: 1 },
      });
    });
  });
});
