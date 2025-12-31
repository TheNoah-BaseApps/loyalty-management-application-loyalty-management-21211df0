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
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Megaphone, Calendar, Target, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyCampaignManagementPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaign_id: '',
    product_id: '',
    product_name: '',
    campaign_name: '',
    campaign_type: '',
    start_date: '',
    end_date: '',
    target_tiers: '',
    bonus_points: '',
    minimum_spend: '',
    max_rewards: '',
    terms_conditions: '',
    channel_type: '',
    target_audience: '',
    is_active: true,
    created_by: ''
  });
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBonusPoints: 0,
    upcomingCampaigns: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const response = await fetch('/api/loyalty-campaign-management');
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const totalCampaigns = data.length;
    const activeCampaigns = data.filter(c => c.is_active).length;
    const totalBonusPoints = data.reduce((sum, c) => sum + (parseInt(c.bonus_points) || 0), 0);
    const now = new Date();
    const upcomingCampaigns = data.filter(c => new Date(c.start_date) > now).length;

    setStats({ totalCampaigns, activeCampaigns, totalBonusPoints, upcomingCampaigns });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/loyalty-campaign-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campaign created successfully');
        setIsAddDialogOpen(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Error creating campaign');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/loyalty-campaign-management/${selectedCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campaign updated successfully');
        setIsEditDialogOpen(false);
        setSelectedCampaign(null);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Error updating campaign');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/loyalty-campaign-management/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error deleting campaign');
    }
  }

  function handleEdit(campaign) {
    setSelectedCampaign(campaign);
    setFormData({
      campaign_id: campaign.campaign_id || '',
      product_id: campaign.product_id || '',
      product_name: campaign.product_name || '',
      campaign_name: campaign.campaign_name || '',
      campaign_type: campaign.campaign_type || '',
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      target_tiers: campaign.target_tiers || '',
      bonus_points: campaign.bonus_points || '',
      minimum_spend: campaign.minimum_spend || '',
      max_rewards: campaign.max_rewards || '',
      terms_conditions: campaign.terms_conditions || '',
      channel_type: campaign.channel_type || '',
      target_audience: campaign.target_audience || '',
      is_active: campaign.is_active || false,
      created_by: campaign.created_by || ''
    });
    setIsEditDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      campaign_id: '',
      product_id: '',
      product_name: '',
      campaign_name: '',
      campaign_type: '',
      start_date: '',
      end_date: '',
      target_tiers: '',
      bonus_points: '',
      minimum_spend: '',
      max_rewards: '',
      terms_conditions: '',
      channel_type: '',
      target_audience: '',
      is_active: true,
      created_by: ''
    });
  }

  function getCampaignStatus(campaign) {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);

    if (!campaign.is_active) return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    if (now < start) return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now > end) return { text: 'Ended', color: 'bg-red-100 text-red-800' };
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
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
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Campaign Management</h1>
          <p className="text-gray-500 mt-1">Create and manage marketing campaigns and promotions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a new loyalty marketing campaign</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_id">Campaign ID *</Label>
                  <Input
                    id="campaign_id"
                    value={formData.campaign_id}
                    onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_name">Campaign Name *</Label>
                  <Input
                    id="campaign_name"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_type">Campaign Type *</Label>
                  <Select value={formData.campaign_type} onValueChange={(value) => setFormData({...formData, campaign_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seasonal">Seasonal</SelectItem>
                      <SelectItem value="Product Launch">Product Launch</SelectItem>
                      <SelectItem value="Retention">Retention</SelectItem>
                      <SelectItem value="Acquisition">Acquisition</SelectItem>
                      <SelectItem value="Bonus Points">Bonus Points</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_tiers">Target Tiers</Label>
                  <Input
                    id="target_tiers"
                    value={formData.target_tiers}
                    onChange={(e) => setFormData({...formData, target_tiers: e.target.value})}
                    placeholder="e.g., Gold, Platinum"
                  />
                </div>
                <div>
                  <Label htmlFor="bonus_points">Bonus Points</Label>
                  <Input
                    id="bonus_points"
                    type="number"
                    value={formData.bonus_points}
                    onChange={(e) => setFormData({...formData, bonus_points: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_spend">Minimum Spend</Label>
                  <Input
                    id="minimum_spend"
                    type="number"
                    value={formData.minimum_spend}
                    onChange={(e) => setFormData({...formData, minimum_spend: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="max_rewards">Max Rewards</Label>
                  <Input
                    id="max_rewards"
                    type="number"
                    value={formData.max_rewards}
                    onChange={(e) => setFormData({...formData, max_rewards: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="channel_type">Channel Type</Label>
                  <Select value={formData.channel_type} onValueChange={(value) => setFormData({...formData, channel_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="App">App</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="All">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="created_by">Created By</Label>
                  <Input
                    id="created_by"
                    value={formData.created_by}
                    onChange={(e) => setFormData({...formData, created_by: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Campaign</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonus Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBonusPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingCampaigns}</div>
            <p className="text-xs text-muted-foreground">Scheduled campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>Manage all loyalty marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first loyalty campaign</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Bonus Points</TableHead>
                    <TableHead>Target Tiers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.campaign_id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.campaign_name}</div>
                            {campaign.product_name && (
                              <div className="text-sm text-gray-500">{campaign.product_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{campaign.campaign_type}</TableCell>
                        <TableCell>
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {parseInt(campaign.bonus_points || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{campaign.target_tiers || '-'}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(campaign)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(campaign.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_campaign_id">Campaign ID *</Label>
                <Input
                  id="edit_campaign_id"
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_campaign_name">Campaign Name *</Label>
                <Input
                  id="edit_campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_campaign_type">Campaign Type *</Label>
                <Select value={formData.campaign_type} onValueChange={(value) => setFormData({...formData, campaign_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                    <SelectItem value="Product Launch">Product Launch</SelectItem>
                    <SelectItem value="Retention">Retention</SelectItem>
                    <SelectItem value="Acquisition">Acquisition</SelectItem>
                    <SelectItem value="Bonus Points">Bonus Points</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_target_tiers">Target Tiers</Label>
                <Input
                  id="edit_target_tiers"
                  value={formData.target_tiers}
                  onChange={(e) => setFormData({...formData, target_tiers: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_bonus_points">Bonus Points</Label>
                <Input
                  id="edit_bonus_points"
                  type="number"
                  value={formData.bonus_points}
                  onChange={(e) => setFormData({...formData, bonus_points: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_minimum_spend">Minimum Spend</Label>
                <Input
                  id="edit_minimum_spend"
                  type="number"
                  value={formData.minimum_spend}
                  onChange={(e) => setFormData({...formData, minimum_spend: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_max_rewards">Max Rewards</Label>
                <Input
                  id="edit_max_rewards"
                  type="number"
                  value={formData.max_rewards}
                  onChange={(e) => setFormData({...formData, max_rewards: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_channel_type">Channel Type</Label>
                <Select value={formData.channel_type} onValueChange={(value) => setFormData({...formData, channel_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="App">App</SelectItem>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="All">All Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_target_audience">Target Audience</Label>
                <Input
                  id="edit_target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_created_by">Created By</Label>
                <Input
                  id="edit_created_by"
                  value={formData.created_by}
                  onChange={(e) => setFormData({...formData, created_by: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_terms_conditions">Terms & Conditions</Label>
              <Textarea
                id="edit_terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="edit_is_active">Active Campaign</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}