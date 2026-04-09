import SpinWheel from '../gamification/SpinWheel';

/**
 * Dashboard rewards section.
 * Shows the weekly spin wheel for earning free rewards.
 *
 * @param {object} props
 * @param {object} props.subscription - Subscription state from useSubscription hook.
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated.
 */
export default function RewardsSection({ subscription, isAuthenticated }) {
  return (
    <div className="tu-dash-content">
      <h2 className="tu-dash-title">Weekly Rewards</h2>
      <p className="tu-dash-subtitle">Spin the wheel once per week for free rewards</p>
      <SpinWheel subscription={subscription} isAuthenticated={isAuthenticated} />
    </div>
  );
}
