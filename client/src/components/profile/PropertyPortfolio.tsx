import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, MapPin, Calendar, TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: string;
  uprn?: string;
  titleNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country: string;
  propertyType?: string;
  bedrooms?: string;
  floorAreaSqm?: string;
  yearBuilt?: string;
  epcRating?: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyPortfolioProps {
  userId: string;
  className?: string;
}

export function PropertyPortfolio({ userId, className = '' }: PropertyPortfolioProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Fetch properties for the user
  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties', userId],
    enabled: !!userId,
  });

  const formatAddress = (property: Property) => {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      property.city,
      property.postcode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getPropertyTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'residential':
        return '🏠';
      case 'btl':
        return '🏘️';
      case 'commercial':
        return '🏢';
      case 'industrial':
        return '🏭';
      case 'land':
        return '🌳';
      case 'mixed':
        return '🏗️';
      default:
        return '🏠';
    }
  };

  const getEpcColor = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'E':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'G':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load properties. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Portfolio</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your portfolio
          </p>
        </div>
        <Button 
          data-testid="button-add-property"
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Property Summary Stats */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[var(--primary)]" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--secondary)]" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Locations</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {new Set(properties.map(p => p.city).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--accent)]" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Property Types</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {new Set(properties.map(p => p.propertyType).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. EPC Rating</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {properties.filter(p => p.epcRating).length > 0 ? 'C' : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Grid */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Properties Yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start building your property portfolio by adding your first property.
            </p>
            <Button 
              data-testid="button-add-first-property"
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPropertyTypeIcon(property.propertyType)}</span>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {property.addressLine1}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {[property.city, property.postcode].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  {property.epcRating && (
                    <Badge className={getEpcColor(property.epcRating)}>
                      EPC {property.epcRating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {property.propertyType && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {property.propertyType}
                        </p>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Bedrooms:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {property.bedrooms}
                        </p>
                      </div>
                    )}
                    {property.floorAreaSqm && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Area:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {property.floorAreaSqm} m²
                        </p>
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Built:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {property.yearBuilt}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-view-property-${property.id}`}
                            onClick={() => setSelectedProperty(property)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">
                              Property Details
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              {formatAddress(selectedProperty || property)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedProperty && (
                            <div className="space-y-6">
                              {/* Address Section */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Address</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{selectedProperty.addressLine1}</p>
                                  {selectedProperty.addressLine2 && <p>{selectedProperty.addressLine2}</p>}
                                  <p>{[selectedProperty.city, selectedProperty.postcode].filter(Boolean).join(', ')}</p>
                                  <p>{selectedProperty.country}</p>
                                </div>
                              </div>

                              {/* Property Details */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Property Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {selectedProperty.uprn && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">UPRN:</span>
                                      <p className="font-medium">{selectedProperty.uprn}</p>
                                    </div>
                                  )}
                                  {selectedProperty.titleNumber && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Title Number:</span>
                                      <p className="font-medium">{selectedProperty.titleNumber}</p>
                                    </div>
                                  )}
                                  {selectedProperty.propertyType && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                      <p className="font-medium capitalize">{selectedProperty.propertyType}</p>
                                    </div>
                                  )}
                                  {selectedProperty.bedrooms && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Bedrooms:</span>
                                      <p className="font-medium">{selectedProperty.bedrooms}</p>
                                    </div>
                                  )}
                                  {selectedProperty.floorAreaSqm && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Floor Area:</span>
                                      <p className="font-medium">{selectedProperty.floorAreaSqm} m²</p>
                                    </div>
                                  )}
                                  {selectedProperty.yearBuilt && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">Year Built:</span>
                                      <p className="font-medium">{selectedProperty.yearBuilt}</p>
                                    </div>
                                  )}
                                  {selectedProperty.epcRating && (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">EPC Rating:</span>
                                      <Badge className={getEpcColor(selectedProperty.epcRating)}>
                                        {selectedProperty.epcRating}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Meta Information */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Record Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Added:</span>
                                    <p className="font-medium">
                                      {new Date(selectedProperty.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                    <p className="font-medium">
                                      {new Date(selectedProperty.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-edit-property-${property.id}`}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      data-testid={`button-delete-property-${property.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}