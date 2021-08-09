import React from 'react';
import { useStore } from 'effector-react';

import { $syncProgress, $syncPercent } from '@state/intro';

const Progress = () => {
  const [done, total] = useStore($syncProgress);
  const syncPercent = useStore($syncPercent);

  return (
    <div>
      <h1>Loading</h1>
      {total > 0 && (
        <div>
          {syncPercent}% ({done}/{total})
        </div>
      )}
    </div>
  );
};

export default Progress;