import { usePreference } from '../context/PreferenceContext';
import DashboardTenant from './DashboardTenant';
import DashboardOwner from './DashboardOwner';
import Navbar from '../components/Navbar';

const Dashboard = ({ user }) => {
    const { preference } = usePreference();

    return (
        <div>
            <Navbar user={user} />
            {preference === 'TENANT' ? <DashboardTenant /> : <DashboardOwner />}
        </div>
    );
};

export default Dashboard;
