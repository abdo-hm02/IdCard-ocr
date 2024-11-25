import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

const ResultsStep = ({ data }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold">Verified Information</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <p className="text-sm text-gray-500 capitalize mb-1">{key.replace('_', ' ')}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ResultsStep;