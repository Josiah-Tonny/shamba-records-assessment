export const computeStatus = (field) => {
  if (field.stage === 'harvested') {
    return 'Completed';
  }

  if (['planted', 'growing'].includes(field.stage)) {
    const plantingDate = new Date(field.planting_date);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    if (plantingDate < ninetyDaysAgo) {
      return 'At Risk';
    }
  }

  return 'Active';
};