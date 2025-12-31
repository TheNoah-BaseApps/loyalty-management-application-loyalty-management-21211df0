'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function AccrualManagementPage() {
  const [accruals, setAccruals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccrual, setSelectedAccrual] = useState(null);
  const [formData, setFormData] = useState({
    accrual_id: '',
    product_id: '',
    product_name: '',
    customer_id: '',
    customer_name: '',
    transaction_date: '',
    transaction_amount: '',
    points_earned: '',
    accrual_type: '',
    total_accrued_points: '',
    rule_id: '',
    points_status: 'Pending',
    processing_date: '',
    channel_source: '',
    partner_code: '',
    program_type: '',
    accrual_notes: ''
  });
  const [stats, setStats] = useState({
    totalAccruals: 0,
    totalPoints: 0,
    pendingPoints: 0,
    activeCustomers: 0
  });

  useEffect(() => {
    fetchAccruals();
  }, []);

  async function fetchAccruals() {
    try {
      setLoading(true);
      const response = await fetch('/api/accrual-management');
      const data = await response.json();
      
      if (data.success) {
        setAccruals(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load accrual records');
      }
    } catch (error) {
      console.error('Error fetching accruals:', error);
      toast.error('Error loading accrual records');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const totalAccruals = data.length;
    const totalPoints = data.reduce((sum, a) => sum + (parseInt(a.points_earned) || 0), 0);
    const pendingPoints = data
      .filter(a => a.points_status === 'Pending')
      .reduce((sum, a) => sum + (parseInt(a.points_earned) || 0), 0);
    const activeCustomers = new Set(data.map(a => a.customer_id)).size;

    setStats({ totalAccruals, totalPoints, pendingPoints, activeCustomers });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/accrual-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Accrual record created successfully');
        setIsAddDialogOpen(false);
        resetForm();
        fetchAccruals();
      } else {
        toast.error(data.error || 'Failed to create accrual record');
      }
    } catch (error) {
      console.error('Error creating accrual:', error);
      toast.error('Error creating accrual record');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/accrual-management/${selectedAccrual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Accrual record updated successfully');
        setIsEditDialogOpen(false);
        setSelectedAccrual(null);
        resetForm();
        fetchAccruals();
      } else {
        toast.error(data.error || 'Failed to update accrual record');
      }
    } catch (error) {
      console.error('Error updating accrual:', error);
      toast.error('Error updating accrual record');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this accrual record?')) return;

    try {
      const response = await fetch(`/api/accrual-management/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Accrual record deleted successfully');
        fetchAccruals();
      } else {
        toast.error(data.error || 'Failed to delete accrual record');
      }
    } catch (error) {
      console.error('Error deleting accrual:', error);
      toast.error('Error deleting accrual record');
    }
  }

  function handleEdit(accrual) {
    setSelectedAccrual(accrual);
    setFormData({
      accrual_id: accrual.accrual_id || '',
      product_id: accrual.product_id || '',
      product_name: accrual.product_name || '',
      customer_id: accrual.customer_id || '',
      customer_name: accrual.customer_name || '',
      transaction_date: accrual.transaction_date ? accrual.transaction_date.split('T')[0] : '',
      transaction_amount: accrual.transaction_amount || '',
      points_earned: accrual.points_earned || '',
      accrual_type: accrual.accrual_type || '',
      total_accrued_points: accrual.total_accrued_points || '',
      rule_id: accrual.rule_id || '',
      points_status: accrual.points_status || '',
      processing_date: accrual.processing_date ? accrual.processing_date.split('T')[0] : '',
      channel_source: accrual.channel_source || '',
      partner_code: accrual.partner_code || '',
      program_type: accrual.program_type || '',
      accrual_notes: accrual.accrual_notes || ''
    });
    setIsEditDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      accrual_id: '',
      product_id: '',
      product_name: '',
      customer_id: '',
      customer_name: '',
      transaction_date: '',
      transaction_amount: '',
      points_earned: '',
      accrual_type: '',
      total_accrued_points: '',
      rule_id: '',
      points_status: 'Pending',
      processing_date: '',
      channel_source: '',
      partner_code: '',
      program_type: '',
      accrual_notes: ''
    });
  }

  function getStatusColor(status) {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accrual Management</h1>
          <p className="text-gray-500 mt-1">Track and manage points accrual from transactions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Accrual
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Accrual Record</DialogTitle>
              <DialogDescription>Add a new points accrual transaction</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accrual_id">Accrual ID *</Label>
                  <Input
                    id="accrual_id"
                    value={formData.accrual_id}
                    onChange={(e) => setFormData({...formData, accrual_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_id">Customer ID *</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
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
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_date">Transaction Date *</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_amount">Transaction Amount *</Label>
                  <Input
                    id="transaction_amount"
                    type="number"
                    value={formData.transaction_amount}
                    onChange={(e) => setFormData({...formData, transaction_amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="points_earned">Points Earned *</Label>
                  <Input
                    id="points_earned"
                    type="number"
                    value={formData.points_earned}
                    onChange={(e) => setFormData({...formData, points_earned: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accrual_type">Accrual Type *</Label>
                  <Select value={formData.accrual_type} onValueChange={(value) => setFormData({...formData, accrual_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Bonus">Bonus</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Campaign">Campaign</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points_status">Points Status *</Label>
                  <Select value={formData.points_status} onValueChange={(value) => setFormData({...formData, points_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="total_accrued_points">Total Accrued Points</Label>
                  <Input
                    id="total_accrued_points"
                    type="number"
                    value={formData.total_accrued_points}
                    onChange={(e) => setFormData({...formData, total_accrued_points: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="rule_id">Rule ID</Label>
                  <Input
                    id="rule_id"
                    value={formData.rule_id}
                    onChange={(e) => setFormData({...formData, rule_id: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="processing_date">Processing Date</Label>
                  <Input
                    id="processing_date"
                    type="date"
                    value={formData.processing_date}
                    onChange={(e) => setFormData({...formData, processing_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="channel_source">Channel Source</Label>
                  <Input
                    id="channel_source"
                    value={formData.channel_source}
                    onChange={(e) => setFormData({...formData, channel_source: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="partner_code">Partner Code</Label>
                  <Input
                    id="partner_code"
                    value={formData.partner_code}
                    onChange={(e) => setFormData({...formData, partner_code: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="program_type">Program Type</Label>
                  <Input
                    id="program_type"
                    value={formData.program_type}
                    onChange={(e) => setFormData({...formData, program_type: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accrual_notes">Notes</Label>
                <Textarea
                  id="accrual_notes"
                  value={formData.accrual_notes}
                  onChange={(e) => setFormData({...formData, accrual_notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Accrual</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accruals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccruals}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Points earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Points</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">With accruals</p>
          </CardContent>
        </Card>
      </div>

      {/* Accruals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accrual Records</CardTitle>
          <CardDescription>Manage all points accrual transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {accruals.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accrual records yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first accrual record</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Accrual
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accrual ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Transaction Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accruals.map((accrual) => (
                    <TableRow key={accrual.id}>
                      <TableCell className="font-medium">{accrual.accrual_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{accrual.customer_name}</div>
                          <div className="text-sm text-gray-500">{accrual.customer_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {accrual.product_name || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(accrual.transaction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseInt(accrual.transaction_amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {parseInt(accrual.points_earned || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{accrual.accrual_type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(accrual.points_status)}>
                          {accrual.points_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(accrual)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(accrual.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Accrual Record</DialogTitle>
            <DialogDescription>Update accrual transaction details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_accrual_id">Accrual ID *</Label>
                <Input
                  id="edit_accrual_id"
                  value={formData.accrual_id}
                  onChange={(e) => setFormData({...formData, accrual_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_customer_id">Customer ID *</Label>
                <Input
                  id="edit_customer_id"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_customer_name">Customer Name *</Label>
                <Input
                  id="edit_customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_product_id">Product ID</Label>
                <Input
                  id="edit_product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_product_name">Product Name</Label>
                <Input
                  id="edit_product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_transaction_date">Transaction Date *</Label>
                <Input
                  id="edit_transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_transaction_amount">Transaction Amount *</Label>
                <Input
                  id="edit_transaction_amount"
                  type="number"
                  value={formData.transaction_amount}
                  onChange={(e) => setFormData({...formData, transaction_amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_points_earned">Points Earned *</Label>
                <Input
                  id="edit_points_earned"
                  type="number"
                  value={formData.points_earned}
                  onChange={(e) => setFormData({...formData, points_earned: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_accrual_type">Accrual Type *</Label>
                <Select value={formData.accrual_type} onValueChange={(value) => setFormData({...formData, accrual_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase</SelectItem>
                    <SelectItem value="Bonus">Bonus</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Campaign">Campaign</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_points_status">Points Status *</Label>
                <Select value={formData.points_status} onValueChange={(value) => setFormData({...formData, points_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_total_accrued_points">Total Accrued Points</Label>
                <Input
                  id="edit_total_accrued_points"
                  type="number"
                  value={formData.total_accrued_points}
                  onChange={(e) => setFormData({...formData, total_accrued_points: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_rule_id">Rule ID</Label>
                <Input
                  id="edit_rule_id"
                  value={formData.rule_id}
                  onChange={(e) => setFormData({...formData, rule_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_processing_date">Processing Date</Label>
                <Input
                  id="edit_processing_date"
                  type="date"
                  value={formData.processing_date}
                  onChange={(e) => setFormData({...formData, processing_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_channel_source">Channel Source</Label>
                <Input
                  id="edit_channel_source"
                  value={formData.channel_source}
                  onChange={(e) => setFormData({...formData, channel_source: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_partner_code">Partner Code</Label>
                <Input
                  id="edit_partner_code"
                  value={formData.partner_code}
                  onChange={(e) => setFormData({...formData, partner_code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_program_type">Program Type</Label>
                <Input
                  id="edit_program_type"
                  value={formData.program_type}
                  onChange={(e) => setFormData({...formData, program_type: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_accrual_notes">Notes</Label>
              <Textarea
                id="edit_accrual_notes"
                value={formData.accrual_notes}
                onChange={(e) => setFormData({...formData, accrual_notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Accrual</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}