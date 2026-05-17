import { Users, BookOpen, GraduationCap, TrendingUp, MoreVertical, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getAdminStats();
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-border"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-white rounded-3xl border border-border"></div>
          <div className="h-80 bg-white rounded-3xl border border-border"></div>
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Students', value: data?.stats.totalStudents || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+0%', trendColor: 'text-green-600' },
    { name: 'Active Courses', value: data?.stats.totalCourses || 0, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+0', trendColor: 'text-green-600' },
    { name: 'Total Enrollments', value: data?.stats.totalEnrollments || 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+0%', trendColor: 'text-green-600' },
    { name: 'Monthly Growth', value: '0%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+0%', trendColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Overview</h1>
        <p className="text-text-secondary mt-1 font-medium">Real-time statistics and platform health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-border shadow-premium hover:shadow-premium-hover transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <button className="text-text-secondary hover:text-text-primary">
                <MoreVertical size={18} />
              </button>
            </div>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">{stat.name}</p>
            <div className="flex items-end gap-3 mt-1">
              <h3 className="text-2xl font-black text-text-primary">{stat.value}</h3>
              <span className={`text-xs font-bold ${stat.trendColor} mb-1 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Popularity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-border shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Course Popularity</h3>
              <p className="text-sm text-text-secondary font-medium">Top 5 courses by enrollment count</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-around gap-4 px-4">
            {data?.coursePerformance.length > 0 ? (
              data.coursePerformance.map((item: any, i: number) => {
                const maxCount = Math.max(...data.coursePerformance.map((p: any) => p.count), 1);
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group max-w-[80px]">
                    {/* Bar Container */}
                    <div className="w-full h-48 flex items-end justify-center px-1 mb-4">
                      <div 
                        className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t-xl transition-all duration-500 relative group-hover:from-primary shadow-lg border-x border-t border-primary/20" 
                        style={{ height: `${Math.max(height, 8)}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all font-black shadow-xl z-20 whitespace-nowrap">
                          {item.count} Students
                        </div>
                      </div>
                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest truncate w-full text-center" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold">
                No enrollment data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white p-8 rounded-3xl border border-border shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Recent Enrollments</h3>
            <Link to="/admin/students" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
              View All <ExternalLink size={14} />
            </Link>
          </div>
          
          <div className="space-y-6">
            {data?.recentEnrollments.length > 0 ? (
              data.recentEnrollments.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors font-bold text-xs shadow-sm">
                    {item.user.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{item.user.fullName}</p>
                    <p className="text-xs text-text-secondary truncate">{item.course.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-text-secondary uppercase">
                      {new Date(item.enrolledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <span className="text-[10px] font-black uppercase text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-secondary font-medium">No recent enrollments</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
