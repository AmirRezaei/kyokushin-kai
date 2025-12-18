// File: ./src/app/Equipment/helper.ts

// Using date-fns for reliable date calculations
import {addWeeks} from 'date-fns';

import {TrainingSet} from './types';

/**
 * Calculates the average slope (rate of weight change per day) based on the training sets from the last specified weeks.
 *
 * @param sets - Array of TrainingSet objects containing date and weight.
 * @param weeks - Number of weeks to look back for calculating the average slope.
 * @returns The average slope as a number, or null if insufficient data.
 */
export const calculateAverageSlope = (sets: TrainingSet[], weeks: number): number | null => {
   // Input validation
   if (!Array.isArray(sets) || sets.length < 2) return null;
   if (typeof weeks !== 'number' || weeks <= 0) return null;

   // Calculate the start timestamp based on the number of weeks
   const endTimestamp = Date.now();
   const startTimestamp = endTimestamp - weeks * 7 * 24 * 60 * 60 * 1000;

   // Sort sets by date in ascending order and map to include timestamp
   const sortedSets = sets
      .map(set => ({
         ...set,
         timestamp: new Date(set.date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

   // Filter sets within the specified time frame
   const recentSets = sortedSets.filter(set => set.timestamp >= startTimestamp);

   // Check for sufficient data
   if (recentSets.length < 2) return null;

   // Calculate slopes between consecutive sets
   const slopes = recentSets.slice(1).map((set, index) => {
      const prevSet = recentSets[index];
      const timeDiff = (set.timestamp - prevSet.timestamp) / (1000 * 60 * 60 * 24); // Difference in days

      if (timeDiff <= 0) {
         // Invalid time difference; skip or handle accordingly
         return null;
      }

      const weightDiff = set.weight - prevSet.weight;
      return weightDiff / timeDiff; // Slope (kg/day)
   });

   // Filter out invalid slopes
   const validSlopes = slopes.filter((slope): slope is number => slope !== null);

   // If no valid slopes, return null
   if (validSlopes.length === 0) return null;

   // Calculate the average slope
   const averageSlope = validSlopes.reduce((sum, slope) => sum + slope, 0) / validSlopes.length;

   return averageSlope;
};

/**
 * Generates forecast data points based on historical data and an average slope.
 *
 * @param dataPoints - Array of existing data points with x (timestamp) and y (value).
 * @param averageSlope - Average rate of change per day (e.g., kg/day).
 * @param forecastCount - Number of future points to generate.
 * @returns Array of forecasted data points.
 */
export const generateForecastPoints = (dataPoints: {x: number; y: number}[], averageSlope: number, forecastCount: number): {x: number; y: number}[] => {
   // Input validation
   if (forecastCount <= 0) return [];
   if (dataPoints.length === 0) return [];

   const lastPoint = dataPoints[dataPoints.length - 1];
   const newPoints: {x: number; y: number}[] = [];

   for (let i = 1; i <= forecastCount; i++) {
      // Calculate the new date by adding i weeks to the last point's date
      const newDate = addWeeks(new Date(lastPoint.x), i);
      const newTimestamp = newDate.getTime();

      // Calculate the y value by adding the total slope over the interval
      const totalSlope = averageSlope * 7 * i; // 7 days per week
      const newY = lastPoint.y + totalSlope;

      newPoints.push({
         x: newTimestamp,
         y: newY,
      });
   }

   return newPoints;
};
