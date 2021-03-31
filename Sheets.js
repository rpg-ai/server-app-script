function findRow(sheet, column, value) {
    const data = sheet.getDataRange().getValues()
    for(var i = 0; i<data.length;i++){
      if(data[i][column] == value){
        return i+1
      }
    }
    return null
  }

  