import React, { useState } from 'react';
import { FileText, Calendar, Archive, Plus, Clock, CheckCircle, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { ReviewSchedule } from '../../types';
import toast from 'react-hot-toast';

interface QuickActionsProps {
  onCreateReport: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onCreateReport }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([
    {
      _id: '1',
      reportId: 'report-1',
      scheduledDate: new Date('2024-02-15'),
      reviewType: 'monthly',
      assignedTo: 'admin@hospital.com',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      reportId: 'report-2',
      scheduledDate: new Date('2024-03-31'),
      reviewType: 'quarterly',
      assignedTo: 'finance@hospital.com',
      status: 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      reportId: 'report-3',
      scheduledDate: new Date('2024-02-28'),
      reviewType: 'audit',
      assignedTo: 'auditor@hospital.com',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const handleScheduleReview = () => {
    setShowScheduleModal(true);
    toast.success('Membuka form jadwal review');
  };

  const handleArchiveReports = () => {
    setShowArchiveModal(true);
    toast.success('Membuka dialog arsip laporan');
  };

  const handleAnalytics = () => {
    setShowAnalyticsModal(true);
    toast.success('Membuka analisis keuangan');
  };

  const createSchedule = (data: any) => {
    const newSchedule: ReviewSchedule = {
      _id: Math.random().toString(36).substr(2, 9),
      reportId: 'new-report',
      scheduledDate: new Date(data.date),
      reviewType: data.type,
      assignedTo: data.assignee,
      status: 'pending',
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    setShowScheduleModal(false);
    toast.success(`Jadwal review ${data.type} berhasil dibuat untuk tanggal ${new Date(data.date).toLocaleDateString('id-ID')}`);
  };

  const archiveOldReports = () => {
    // In real app, call API to archive reports
    toast.success('17 laporan lama berhasil diarsipkan', {
      duration: 4000,
      icon: '📁',
    });
    setShowArchiveModal(false);
  };

  const updateScheduleStatus = (scheduleId: string, newStatus: 'pending' | 'in-progress' | 'completed' | 'overdue') => {
    setSchedules(prev => prev.map(schedule => 
      schedule._id === scheduleId 
        ? { ...schedule, status: newStatus, updatedAt: new Date() }
        : schedule
    ));
    
    const statusText = {
      'pending': 'menunggu',
      'in-progress': 'sedang berlangsung',
      'completed': 'selesai',
      'overdue': 'terlambat'
    };
    
    toast.success(`Status review diubah menjadi ${statusText[newStatus]}`);
  };

  const deleteSchedule = (scheduleId: string) => {
    const schedule = schedules.find(s => s._id === scheduleId);
    setSchedules(prev => prev.filter(s => s._id !== scheduleId));
    toast.success(`Jadwal review ${schedule?.reviewType} berhasil dihapus`);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              onCreateReport();
              toast.success('Membuka form laporan baru');
            }}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            <span className="text-gray-600 group-hover:text-blue-600">Buat Laporan Baru</span>
          </button>
          
          <button
            onClick={handleScheduleReview}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <Calendar className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
            <span className="text-gray-600 group-hover:text-green-600">Jadwal Review</span>
          </button>
          
          <button
            onClick={handleArchiveReports}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Archive className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
            <span className="text-gray-600 group-hover:text-purple-600">Arsip Laporan</span>
          </button>

          <button
            onClick={handleAnalytics}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-orange-500" />
            <span className="text-gray-600 group-hover:text-orange-600">Analisis Keuangan</span>
          </button>
        </div>

        {/* Recent Schedules */}
        {schedules.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-900">Jadwal Review</h4>
              <span className="text-sm text-gray-500">{schedules.length} jadwal</span>
            </div>
            <div className="space-y-2">
              {schedules.slice(0, 4).map((schedule) => (
                <div key={schedule._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      schedule.status === 'pending' ? 'bg-yellow-100' :
                      schedule.status === 'in-progress' ? 'bg-blue-100' :
                      schedule.status === 'completed' ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      {schedule.status === 'pending' ? (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      ) : schedule.status === 'in-progress' ? (
                        <Calendar className="h-3 w-3 text-blue-600" />
                      ) : schedule.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Review {schedule.reviewType === 'monthly' ? 'Bulanan' : 
                               schedule.reviewType === 'quarterly' ? 'Kuartalan' : 
                               schedule.reviewType === 'annual' ? 'Tahunan' : 'Audit'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {schedule.scheduledDate.toLocaleDateString('id-ID')} • {schedule.assignedTo.split('@')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status === 'pending' ? 'Menunggu' :
                       schedule.status === 'in-progress' ? 'Berlangsung' : 
                       schedule.status === 'completed' ? 'Selesai' : 'Terlambat'}
                    </span>
                    {schedule.status === 'pending' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule._id, 'in-progress')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mulai
                      </button>
                    )}
                    {schedule.status === 'in-progress' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule._id, 'completed')}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {schedules.length > 4 && (
              <div className="mt-3 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Lihat semua jadwal ({schedules.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Review Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jadwal Review Baru</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createSchedule({
                date: formData.get('date'),
                type: formData.get('type'),
                assignee: formData.get('assignee'),
                notes: formData.get('notes')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Review
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Review
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih tipe review</option>
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Kuartalan</option>
                    <option value="annual">Tahunan</option>
                    <option value="audit">Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ditugaskan Kepada
                  </label>
                  <select
                    name="assignee"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih penanggung jawab</option>
                    <option value="admin@hospital.com">Administrator</option>
                    <option value="finance@hospital.com">Finance Manager</option>
                    <option value="auditor@hospital.com">Internal Auditor</option>
                    <option value="director@hospital.com">Direktur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Catatan tambahan untuk review..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buat Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    toast.success('Form jadwal review ditutup');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Arsip Laporan Lama</h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Arsipkan laporan yang lebih lama dari 24 bulan untuk mengoptimalkan performa sistem.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Laporan yang akan diarsipkan:</h4>
                    <ul className="text-sm text-yellow-700 mt-1">
                      <li>• 12 laporan bulanan dari tahun 2022</li>
                      <li>• 4 laporan kuartalan dari tahun 2022</li>
                      <li>• 1 laporan tahunan dari tahun 2022</li>
                    </ul>
                    <p className="text-sm text-yellow-700 mt-2 font-medium">
                      Total: 17 laporan (~ 2.3 GB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Catatan:</strong> Laporan yang diarsipkan masih dapat diakses melalui menu arsip, namun tidak akan muncul dalam pencarian reguler.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={archiveOldReports}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Arsipkan Sekarang
              </button>
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  toast.success('Dialog arsip ditutup');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Keuangan Mendalam</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Tren Positif</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Pendapatan meningkat 12% dari bulan lalu</li>
                    <li>• Efisiensi operasional naik 8%</li>
                    <li>• Margin keuntungan stabil di 15%</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Area Perhatian</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Biaya persediaan medis naik 5%</li>
                    <li>• Piutang tertunggak meningkat</li>
                    <li>• Beban utilitas di atas budget</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Rekomendasi</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Evaluasi kontrak supplier persediaan medis</li>
                  <li>• Implementasi sistem reminder untuk piutang</li>
                  <li>• Audit penggunaan energi dan utilitas</li>
                  <li>• Pertimbangkan investasi teknologi hemat energi</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-gray-600">Skor Kesehatan Keuangan</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-gray-600">Tingkat Koleksi Piutang</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">78%</p>
                  <p className="text-sm text-gray-600">Efisiensi Operasional</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowAnalyticsModal(false);
                  toast.success('Analisis keuangan ditutup');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;