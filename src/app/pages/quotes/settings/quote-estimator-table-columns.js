/**
Project: Operator Connect (c)
Title: Price Quote Table Columns  
Description: Settings related to Price Quote list page table column 
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/

export const QuoteEstimatorTableColumns = (intlNamespace) => {
  return [
    {
      key: "productName",
      name: "content.item",
      fieldName: "productName",
      data: "string",
      minWidth: 380,
      isRowHeader: true,
      isResizable: false,
      isSortable: false,
      isSorted: false,
      isSortedDescending: false,
    },
    {
      key: "quantity",
      name: "content.qty",
      fieldName: "quantity",
      data: "string",
      isRowHeader: true,
      isResizable: false,
      isSortable: false,
      isSorted: false,
      isSortedDescending: false,
    },
    {
      key: "termPlan",
      name: "content.term",
      fieldName: "termPlan",
      data: "string",
      isRowHeader: true,
      isResizable: false,
      isSortable: false,
      isSorted: false,
      isSortedDescending: false,
    },
    {
      key: "nrc",
      name: "content.nrc",

      fieldName: "nrc",
      data: "string",
      isRowHeader: true,
      isResizable: false,
      isSortable: false,
      isSorted: false,
      isSortedDescending: false,
    },
    {
      key: "mrc",
      name: "content.mrc",
      fieldName: "mrc",
      data: "string",
      isRowHeader: true,
      isResizable: false,
      isSortable: false,
      isSorted: false,
      isSortedDescending: false,
    },
    
  ];
};
