import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from '../transaction.service';
import { TransactionEntity } from '../entities/transaction.entity';
import { AccountService } from '../../account/account.service';
import { BadRequestException } from '@nestjs/common';
import { AccountEntity } from '../../account/entities/account.entity';

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
  describe('allTransactions', () => {
    const fakeTransaction = {
      id: 1,
      amount: '100',
      createdAt: new Date('2025-04-30 08:40:43.688'),
      type: 'DEPOSIT',
      fromAccountId: 1,
      toAccountId: 2,
      status: 'success',
      clientId: 1,
    } as TransactionEntity;

    beforeEach(() => {
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
    const fakeTransaction = [
      {
        id: 1,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: 'DEPOSIT',
        fromAccount: 1,
        toAccount: 2,
        status: 'success',
        client: 1,
      },
      {
        id: 2,
        amount: '100',
        createdAt: new Date('2025-04-30 08:40:43.688'),
        type: 'DEPOSIT',
        fromAccount: 2,
        toAccount: 1,
        status: 'success',
        client: 1,
      },
    ];

    beforeEach(() => {
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

    it('should return error if account not found', async () => {
      jest
        .spyOn(service, 'findAccountAllTransactions')
        .mockRejectedValueOnce(new BadRequestException('Account Not Found'));

      try {
        await service.findAccountAllTransactions(3, 3);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Account Not Found');
      }
    });
  });

  describe('makeDeposit', () => {
    const fakeTransaction = {
      id: 1,
      amount: '100',
      createdAt: new Date('2025-04-30 08:40:43.688'),
      type: 'DEPOSIT',
      fromAccountId: null,
      toAccountId: 1,
      status: 'success',
      clientId: 1,
    } as TransactionEntity;

    // const fakeAccount = {
    //   id: 1,
    //   name: 'FAKE',
    //   createdAt: new Date('2025-04-30 08:40:43.688'),
    //   balance: '100',
    //   isActive: true,
    //   clientId: 1,
    // } as AccountEntity;

    beforeEach(() => {
      mockSave.mockResolvedValue(fakeTransaction);
      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
    });

    it('should return exists account', async () => {
      const result = await accountService.existsAccount(1, 1);
      expect(result).toEqual(true);
    });

    it('should call exists account with correct args', async () => {
      await accountService.existsAccount(1, 1);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should return active account', async () => {
      const result = await accountService.activeAccount(1);
      expect(result).toEqual(true);
    });

    it('should call active account with correct args', async () => {
      await accountService.activeAccount(1);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should return deposit for account', async () => {
      const result = await service.makeDeposit(1, 1, fakeTransaction);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeDeposit(1, 1, fakeTransaction);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransaction,
        toAccount: { id: 1 },
        status: 'success',
        type: 'DEPOSIT',
        client: { id: 1 },
      });
    });
  });

  describe('makeWithdraw', () => {
    const fakeTransaction = {
      id: 1,
      amount: '100',
      createdAt: new Date('2025-04-30 08:40:43.688'),
      type: 'withdraw',
      fromAccountId: null,
      toAccountId: 1,
      status: 'success',
      clientId: 1,
    } as TransactionEntity;

    const fakeAccount = {
      id: 1,
      name: 'FAKE',
      createdAt: new Date('2025-04-30 08:40:43.688'),
      balance: '100',
      isActive: true,
      clientId: 1,
    } as AccountEntity;

    beforeEach(() => {
      mockExistsAccount.mockResolvedValue(true);
      mockActiveAccount.mockResolvedValue(true);
      mockNegativeBalance.mockResolvedValue(true);
      mockUpdateBalance.mockResolvedValue(fakeAccount);
      mockSave.mockResolvedValue(fakeTransaction);
    });

    it('should return exists account', async () => {
      const result = await accountService.existsAccount(1, 1);
      expect(result).toEqual(true);
    });

    it('should call exists account with correct args', async () => {
      await accountService.existsAccount(1, 1);

      expect(mockExistsAccount).toHaveBeenCalledWith(1, 1);
    });

    it('should return active account', async () => {
      const result = await accountService.activeAccount(1);
      expect(result).toEqual(true);
    });

    it('should call active account with correct args', async () => {
      await accountService.activeAccount(1);

      expect(mockActiveAccount).toHaveBeenCalledWith(1);
    });

    it('should return negative balance', async () => {
      const result = await accountService.negativeBalance(1, '100');
      expect(result).toEqual(true);
    });

    it('should call negative balance with correct args', async () => {
      await accountService.negativeBalance(1, '100');

      expect(mockNegativeBalance).toHaveBeenCalledWith(1, '100');
    });

    it('should return update balance', async () => {
      const result = await accountService.updateBalance(1, 1, '100');

      expect(result).toEqual(fakeAccount);
    });

    it('should call update balance with correct args', async () => {
      await accountService.updateBalance(1, 1, '100');
      expect(mockUpdateBalance).toHaveBeenCalledWith(
        fakeAccount.client,
        fakeAccount.id,
        fakeAccount.balance,
      );
    });

    it('should return withdraw for account', async () => {
      const result = await service.makeWithdraw(1, 1, fakeTransaction);

      expect(result).toEqual(fakeTransaction);
    });

    it('should call save with correct args', async () => {
      await service.makeWithdraw(1, 1, fakeTransaction);

      expect(mockSave).toHaveBeenCalledWith({
        ...fakeTransaction,
        toAccount: { id: 1 },
        status: 'success',
        type: 'withdraw',
        client: { id: 1 },
      });
    });
  });
});
