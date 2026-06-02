import { haptics } from '../haptics';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('haptics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('light() calls impactAsync(Light)', () => {
    haptics.light();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('medium() calls impactAsync(Medium)', () => {
    haptics.medium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('selection() calls selectionAsync', () => {
    haptics.selection();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('success/warning/error map to notificationAsync types', () => {
    haptics.success();
    haptics.warning();
    haptics.error();
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(1, 'success');
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(2, 'warning');
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(3, 'error');
  });

  it('swallows a rejecting call without throwing', () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('no haptics'));
    expect(() => haptics.light()).not.toThrow();
  });
});
