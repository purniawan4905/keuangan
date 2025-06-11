import React, { useState, useEffect } from 'react';
import { Save, Building, DollarSign, Bell, FileText, Users, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { HospitalSettings } from '../../types';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hospital');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HospitalSettings>({
    defaultValues: {
      hospitalName: 'Rumah Sakit Umum Daerah',
      address: 'Jl. Kesehatan No. 123, Jakarta',
      phone: '+62-21-1234567',
      email: 'admin@rsud.go.id',
      taxId: '01.234.567.8-901.000',
      fiscalYearStart: 1,
      currency: 'IDR',
      taxSettings: {
        corporateTaxRate: 0.25,
        vatRate: 0.11,
        withholdingTaxRate: 0.02,
        deductionTypes: ['Penyusutan Peralatan', 'Biaya Operasional', 'Biaya Penelitian']
      },
      reportingSettings: {
        autoApproval: false,
        requireDualApproval: true,
        archiveAfterMonths: 24
      },
      notificationSettings: {
        emailNotifications: true,
        reminderDays: [7, 3, 1]
      }
    }
  });

  const onSubmit = async (data: HospitalSettings) => {
    setLoading(true);
    try {
      // In real app, save to API
      console.log('Saving settings:', data);
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'hospital', name: 'Rumah Sakit', icon: Building },
    { id: 'tax', name: 'Pajak & Keuangan', icon: DollarSign },
    { id: 'reporting', name: 'Pelaporan', icon: FileText },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'users', name: 'Pengguna', icon: Users },
    { id: 'security', name: 'Keamanan', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-gray-600 mt-1">Kelola konfigurasi sistem laporan keuangan</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Hospital Info Tab */}
          {activeTab === 'hospital' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Rumah Sakit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Rumah Sakit
                  </label>
                  <input
                    type="text"
                    {...register('hospitalName', { required: 'Nama rumah sakit wajib diisi' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.hospitalName && (
                    <p className="text-red-500 text-sm mt-1">{errors.hospitalName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NPWP
                  </label>
                  <input
                    type="text"
                    {...register('taxId', { required: 'NPWP wajib diisi' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awal Tahun Fiskal
                  </label>
                  <select
                    {...register('fiscalYearStart')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleDateString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Uang
                  </label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tax Settings Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Pajak & Keuangan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif Pajak Badan (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register('taxSettings.corporateTaxRate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif PPN (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register('taxSettings.vatRate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarif PPh Pasal 23 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register('taxSettings.withholdingTaxRate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Pengurangan Pajak
                </label>
                <div className="space-y-2">
                  {['Penyusutan Peralatan', 'Biaya Operasional', 'Biaya Penelitian', 'Biaya CSR', 'Biaya Pelatihan'].map((deduction) => (
                    <label key={deduction} className="flex items-center">
                      <input
                        type="checkbox"
                        value={deduction}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{deduction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reporting Settings Tab */}
          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Pelaporan</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('reportingSettings.autoApproval')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Persetujuan Otomatis untuk Laporan Bulanan
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('reportingSettings.requireDualApproval')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Memerlukan Persetujuan Ganda untuk Laporan Tahunan
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arsipkan Laporan Setelah (bulan)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    {...register('reportingSettings.archiveAfterMonths')}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Notifikasi</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('notificationSettings.emailNotifications')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aktifkan Notifikasi Email
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pengingat Deadline (hari sebelumnya)
                  </label>
                  <div className="flex gap-4">
                    {[1, 3, 7, 14, 30].map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          value={day}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-1 text-sm text-gray-700">{day} hari</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Manajemen Pengguna</h3>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tambah Pengguna
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Administrator</td>
                      <td className="px-4 py-3 text-sm text-gray-500">admin@hospital.com</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Keamanan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Panjang Password
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    defaultValue={8}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Huruf Besar dan Kecil
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Angka
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Wajib Menggunakan Karakter Khusus
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sesi Timeout (menit)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    defaultValue={30}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;