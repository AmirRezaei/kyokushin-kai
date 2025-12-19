// HEADER-START
// * Path: ./src/app/WordQuest/wordPlay/ChallengingTechniquesModal.tsx
// HEADER-END
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

import { TechniqueRecord } from '../../../../data/model/technique';

interface ChallengingTechniquesModalProps {
  open: boolean;
  onClose: () => void;
  challengingTechniques: Set<string>;
  allTechniques: TechniqueRecord[];
}

const ChallengingTechniquesModal: React.FC<ChallengingTechniquesModalProps> = ({
  open,
  onClose,
  challengingTechniques,
  allTechniques,
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="challenging-techniques-dialog-title">
      <DialogTitle id="challenging-techniques-dialog-title">Challenging Techniques</DialogTitle>
      <DialogContent>
        {Array.from(challengingTechniques).map((techniqueId) => {
          const technique = allTechniques.find((t) => t.id === techniqueId);
          return technique ? (
            <Typography key={technique.id} variant="body1">
              {technique.name.romaji}
            </Typography>
          ) : null;
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChallengingTechniquesModal;
