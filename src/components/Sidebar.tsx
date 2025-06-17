import React, { useEffect, useState } from 'react';
import { useRealTimeUpdates } from '../contexts/RealTimeUpdatesContext';
import { Badge } from 'react-bootstrap';

const Sidebar: React.FC = () => {
  const { supervisions, occurrences, totalSupervisions, totalOccurrences } = useRealTimeUpdates();

  return (
    <div>
      {/* ... existing code ... */}
      <Badge variant="secondary" className="ml-auto">
        {totalSupervisions}
      </Badge>
      <Badge variant="secondary" className="ml-auto">
        {totalOccurrences}
      </Badge>
      {/* ... existing code ... */}
    </div>
  );
};

export default Sidebar; 