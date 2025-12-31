'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, TrendingUp, Award, Calendar, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberEnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0
  });

  const [formData, setFormData] = useState({
    member_id: '',
    product_id: '',
    membership_type: '',
    member_name: '',
    member_gender: '',
    member_age: '',
    member_email: '',
    member_phone: '',
    member_city: '',
    member_state: '',
    member_country: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    current_tier: 'Bronze',
    total_points: 0,
    membership_expiry: '',
    joining_bonus: 0,
    referral_code: '',
    terms_accepted: false,
    communication_preferences: 'Email',
    created_by: ''
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [enrollments]);

  async function fetchEnrollments() {
    try {
      setLoading(true);
      const response = await fetch('/api/member-enrollment');
      const data = await response.json();
      
      if (data.success) {
        setEnrollments(data.data);
      } else {
        toast.error('Failed to load enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Error loading enrollments');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats() {
    const total = enrollments.length;
    const active = enrollments.filter(e => e.status === 'Active').length;
    const pending = enrollments.filter(e => e.status === 'Pending').length;
    const expired = enrollments.filter(e => e.status === 'Expired').length;
    setStats({ total, active, pending, expired });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const dataToSend = {
        ...formData,
        member_age: formData.member_age ? parseInt(formData.member_age) : null,
        total_points: parseInt(formData.total_points) || 0,
        joining_bonus: parseInt(formData.joining_bonus) || 0,
        created_by: userData.name || 'Admin'
      };

      const response = await fetch('/api/member-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Member enrolled successfully!');
        setShowAddModal(false);
        resetForm();
        fetchEnrollments();
      } else {
        toast.error(data.error || 'Failed to enroll member');
      }
    } catch (error) {
      console.error('Error enrolling member:', error);
      toast.error('Error enrolling member');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        member_age: formData.member_age ? parseInt(formData.member_age) : null,
        total_points: parseInt(formData.total_points) || 0,
        joining_bonus: parseInt(formData.joining_bonus) || 0
      };

      const response = await fetch(`/api/member-enrollment/${selectedEnrollment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Enrollment updated successfully!');
        setShowEditModal(false);
        setSelectedEnrollment(null);
        resetForm();
        fetchEnrollments();
      } else {
        toast.error(data.error || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Error updating enrollment');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const response = await fetch(`/api/member-enrollment/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Enrollment deleted successfully!');
        fetchEnrollments();
      } else {
        toast.error(data.error || 'Failed to delete enrollment');
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Error deleting enrollment');
    }
  }

  function openEditModal(enrollment) {
    setSelectedEnrollment(enrollment);
    setFormData({
      member_id: enrollment.member_id || '',
      product_id: enrollment.product_id || '',
      membership_type: enrollment.membership_type || '',
      member_name: enrollment.member_name || '',
      member_gender: enrollment.member_gender || '',
      member_age: enrollment.member_age?.toString() || '',
      member_email: enrollment.member_email || '',
      member_phone: enrollment.member_phone || '',
      member_city: enrollment.member_city || '',
      member_state: enrollment.member_state || '',
      member_country: enrollment.member_country || '',
      enrollment_date: enrollment.enrollment_date?.split('T')[0] || '',
      status: enrollment.status || 'Active',
      current_tier: enrollment.current_tier || 'Bronze',
      total_points: enrollment.total_points?.toString() || '0',
      membership_expiry: enrollment.membership_expiry?.split('T')[0] || '',
      joining_bonus: enrollment.joining_bonus?.toString() || '0',
      referral_code: enrollment.referral_code || '',
      terms_accepted: enrollment.terms_accepted || false,
      communication_preferences: enrollment.communication_preferences || 'Email',
      created_by: enrollment.created_by || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      member_id: '',
      product_id: '',
      membership_type: '',
      member_name: '',
      member_gender: '',
      member_age: '',
      member_email: '',
      member_phone: '',
      member_city: '',
      member_state: '',
      member_country: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      current_tier: 'Bronze',
      total_points: 0,
      membership_expiry: '',
      joining_bonus: 0,
      referral_code: '',
      terms_accepted: false,
      communication_preferences: 'Email',
      created_by: ''
    });
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.member_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-red-100 text-red-800',
      'Suspended': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Enrollment</h1>
          <p className="text-sm text-gray-500 mt-1">Manage member enrollment and registration</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Enroll Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All enrolled members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500 mt-1">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-gray-500 mt-1">Expired memberships</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or member ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Records</CardTitle>
          <CardDescription>View and manage all member enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
              <p className="text-gray-500 mb-4">Get started by enrolling your first member</p>
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Member ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{enrollment.member_id}</td>
                      <td className="py-3 px-4 text-sm font-medium">{enrollment.member_name}</td>
                      <td className="py-3 px-4 text-sm">{enrollment.member_email}</td>
                      <td className="py-3 px-4 text-sm">{enrollment.membership_type}</td>
                      <td className="py-3 px-4 text-sm">{enrollment.current_tier || 'Bronze'}</td>
                      <td className="py-3 px-4 text-sm">{enrollment.total_points || 0}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(enrollment.status)}>
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(enrollment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(enrollment.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Enrollment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll New Member</DialogTitle>
            <DialogDescription>Enter member details to create a new enrollment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member_id">Member ID *</Label>
                <Input
                  id="member_id"
                  value={formData.member_id}
                  onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_id">Product ID</Label>
                <Input
                  id="product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="member_name">Member Name *</Label>
                <Input
                  id="member_name"
                  value={formData.member_name}
                  onChange={(e) => setFormData({...formData, member_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="member_email">Email *</Label>
                <Input
                  id="member_email"
                  type="email"
                  value={formData.member_email}
                  onChange={(e) => setFormData({...formData, member_email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="membership_type">Membership Type *</Label>
                <Select value={formData.membership_type} onValueChange={(value) => setFormData({...formData, membership_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member_phone">Phone</Label>
                <Input
                  id="member_phone"
                  value={formData.member_phone}
                  onChange={(e) => setFormData({...formData, member_phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="member_gender">Gender</Label>
                <Select value={formData.member_gender} onValueChange={(value) => setFormData({...formData, member_gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member_age">Age</Label>
                <Input
                  id="member_age"
                  type="number"
                  value={formData.member_age}
                  onChange={(e) => setFormData({...formData, member_age: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="member_city">City</Label>
                <Input
                  id="member_city"
                  value={formData.member_city}
                  onChange={(e) => setFormData({...formData, member_city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="member_state">State</Label>
                <Input
                  id="member_state"
                  value={formData.member_state}
                  onChange={(e) => setFormData({...formData, member_state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="member_country">Country</Label>
                <Input
                  id="member_country"
                  value={formData.member_country}
                  onChange={(e) => setFormData({...formData, member_country: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="enrollment_date">Enrollment Date *</Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_tier">Current Tier</Label>
                <Select value={formData.current_tier} onValueChange={(value) => setFormData({...formData, current_tier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="joining_bonus">Joining Bonus Points</Label>
                <Input
                  id="joining_bonus"
                  type="number"
                  value={formData.joining_bonus}
                  onChange={(e) => setFormData({...formData, joining_bonus: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="referral_code">Referral Code</Label>
                <Input
                  id="referral_code"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({...formData, referral_code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="membership_expiry">Membership Expiry</Label>
                <Input
                  id="membership_expiry"
                  type="date"
                  value={formData.membership_expiry}
                  onChange={(e) => setFormData({...formData, membership_expiry: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Enroll Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>Update member enrollment details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_member_name">Member Name *</Label>
                <Input
                  id="edit_member_name"
                  value={formData.member_name}
                  onChange={(e) => setFormData({...formData, member_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_member_email">Email *</Label>
                <Input
                  id="edit_member_email"
                  type="email"
                  value={formData.member_email}
                  onChange={(e) => setFormData({...formData, member_email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_current_tier">Current Tier</Label>
                <Select value={formData.current_tier} onValueChange={(value) => setFormData({...formData, current_tier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_total_points">Total Points</Label>
                <Input
                  id="edit_total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData({...formData, total_points: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_membership_expiry">Membership Expiry</Label>
                <Input
                  id="edit_membership_expiry"
                  type="date"
                  value={formData.membership_expiry}
                  onChange={(e) => setFormData({...formData, membership_expiry: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedEnrollment(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Enrollment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}