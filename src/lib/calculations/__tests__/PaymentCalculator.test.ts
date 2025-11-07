import { PaymentCalculator } from '../PaymentCalculator';
import { OnCallUser } from '../OnCallUser';
import { OnCallPeriod } from '../OnCallPeriod';

describe('PaymentCalculator', () => {
  let calculator: PaymentCalculator;

  beforeEach(() => {
    calculator = new PaymentCalculator();
  });

  describe('constructor', () => {
    it('should use default rates if not provided', () => {
      const rates = calculator.getRates();

      expect(rates.weekday).toBe(50); // Default weekday rate
      expect(rates.weekend).toBe(75); // Default weekend rate
      expect(rates.currency).toBe('GBP');
      expect(rates.currencySymbol).toBe('£');
    });

    it('should use custom rates if provided', () => {
      const customCalculator = new PaymentCalculator(100, 150);
      const rates = customCalculator.getRates();

      expect(rates.weekday).toBe(100);
      expect(rates.weekend).toBe(150);
    });
  });

  describe('calculateCompensation', () => {
    it('should calculate compensation for weekday-only periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-18T23:59:59Z'), // Thursday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const compensation = calculator.calculateCompensation(user);

      // Should have 4 weekdays (Mon-Thu)
      expect(compensation).toBe(200); // 4 * 50
    });

    it('should calculate compensation for weekend-only periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-19T00:00:00Z'), // Friday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const compensation = calculator.calculateCompensation(user);

      // Should have 3 weekend days (Fri-Sun)
      expect(compensation).toBe(225); // 3 * 75
    });

    it('should calculate compensation for mixed weekday and weekend periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const compensation = calculator.calculateCompensation(user);

      // Should have 4 weekdays (Mon-Thu) + 3 weekend days (Fri-Sun)
      const expected = 4 * 50 + 3 * 75; // 200 + 225 = 425
      expect(compensation).toBe(expected);
    });

    it('should calculate compensation for multiple periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-16T23:59:59Z'), // Tuesday
          'UTC'
        ),
        new OnCallPeriod(
          new Date('2024-01-20T00:00:00Z'), // Saturday
          new Date('2024-01-21T23:59:59Z'), // Sunday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const compensation = calculator.calculateCompensation(user);

      // 2 weekdays + 2 weekend days
      const expected = 2 * 50 + 2 * 75; // 100 + 150 = 250
      expect(compensation).toBe(expected);
    });

    it('should return 0 for user with no OOH periods', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
          new Date('2024-01-15T10:00:00Z'), // Monday 10 AM (1 hour, not OOH)
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const compensation = calculator.calculateCompensation(user);

      expect(compensation).toBe(0);
    });
  });

  describe('calculateCompensationDetails', () => {
    it('should return detailed compensation breakdown', () => {
      const periods = [
        new OnCallPeriod(
          new Date('2024-01-15T00:00:00Z'), // Monday
          new Date('2024-01-18T23:59:59Z'), // Thursday
          'UTC'
        ),
      ];
      const user = new OnCallUser('user1', 'John Doe', periods, 'john@example.com');

      const details = calculator.calculateCompensationDetails(user);

      expect(details.user.id).toBe('user1');
      expect(details.user.name).toBe('John Doe');
      expect(details.user.email).toBe('john@example.com');
      expect(details.weekdayDays).toBe(4);
      expect(details.weekendDays).toBe(0);
      expect(details.totalCompensation).toBe(200); // 4 * 50
      expect(details.user.periods).toHaveLength(1);
    });

    it('should include period details in response', () => {
      const start = new Date('2024-01-15T00:00:00Z');
      const end = new Date('2024-01-16T23:59:59Z');
      const periods = [new OnCallPeriod(start, end, 'America/New_York')];
      const user = new OnCallUser('user1', 'John Doe', periods);

      const details = calculator.calculateCompensationDetails(user);

      expect(details.user.periods[0].start).toEqual(start);
      expect(details.user.periods[0].end).toEqual(end);
      expect(details.user.periods[0].timezone).toBe('America/New_York');
    });
  });

  describe('calculateBatchCompensation', () => {
    it('should calculate compensation for multiple users', () => {
      const user1Periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T23:59:59Z'), 'UTC'),
      ];
      const user2Periods = [
        new OnCallPeriod(new Date('2024-01-20T00:00:00Z'), new Date('2024-01-21T23:59:59Z'), 'UTC'),
      ];

      const users = [
        new OnCallUser('user1', 'John Doe', user1Periods),
        new OnCallUser('user2', 'Jane Smith', user2Periods),
      ];

      const results = calculator.calculateBatchCompensation(users);

      expect(results.size).toBe(2);
      expect(results.get('user1')).toBe(100); // 2 weekdays * 50
      expect(results.get('user2')).toBe(150); // 2 weekend days * 75
    });

    it('should return empty map for empty users array', () => {
      const results = calculator.calculateBatchCompensation([]);

      expect(results.size).toBe(0);
    });
  });

  describe('calculateBatchCompensationDetails', () => {
    it('should return detailed compensation for all users', () => {
      const user1Periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T23:59:59Z'), 'UTC'),
      ];
      const user2Periods = [
        new OnCallPeriod(new Date('2024-01-20T00:00:00Z'), new Date('2024-01-21T23:59:59Z'), 'UTC'),
      ];

      const users = [
        new OnCallUser('user1', 'John Doe', user1Periods),
        new OnCallUser('user2', 'Jane Smith', user2Periods),
      ];

      const results = calculator.calculateBatchCompensationDetails(users);

      expect(results).toHaveLength(2);
      expect(results[0].user.id).toBe('user1');
      expect(results[0].totalCompensation).toBe(100); // 2 weekdays * 50
      expect(results[1].user.id).toBe('user2');
      expect(results[1].totalCompensation).toBe(150); // 2 weekend days * 75
    });
  });

  describe('calculateTotalCompensation', () => {
    it('should calculate total compensation for all users', () => {
      const user1Periods = [
        new OnCallPeriod(new Date('2024-01-15T00:00:00Z'), new Date('2024-01-16T23:59:59Z'), 'UTC'),
      ];
      const user2Periods = [
        new OnCallPeriod(new Date('2024-01-20T00:00:00Z'), new Date('2024-01-21T23:59:59Z'), 'UTC'),
      ];

      const users = [
        new OnCallUser('user1', 'John Doe', user1Periods),
        new OnCallUser('user2', 'Jane Smith', user2Periods),
      ];

      const total = calculator.calculateTotalCompensation(users);

      expect(total).toBe(250); // 100 + 150
    });

    it('should return 0 for empty users array', () => {
      const total = calculator.calculateTotalCompensation([]);

      expect(total).toBe(0);
    });
  });

  describe('getRates', () => {
    it('should return configured payment rates', () => {
      const rates = calculator.getRates();

      expect(rates).toHaveProperty('weekday');
      expect(rates).toHaveProperty('weekend');
      expect(rates).toHaveProperty('currency');
      expect(rates).toHaveProperty('currencySymbol');
    });

    it('should return custom rates if configured', () => {
      const customCalculator = new PaymentCalculator(150, 250);
      const rates = customCalculator.getRates();

      expect(rates.weekday).toBe(150);
      expect(rates.weekend).toBe(250);
    });
  });
});
