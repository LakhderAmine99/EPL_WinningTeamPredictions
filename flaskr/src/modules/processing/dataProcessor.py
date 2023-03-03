class DataProcessor(object):
    """Data Processor for EPL Winning Team Prediction Model.
    """
    
    def __init__(self,train_data,test_data) -> None:
        """Data Processor for EPL Winning Team Prediction Model.

        Args:
            train_data (DataFrame): _description_
            test_data (DataFrame): _description_
        """
        
        self.train_dataset = train_data
        self.test_dataset = test_data
        
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
        pass
    
    def engineer(self):
        """Engineer data.
        """
        
        useful_data = self.train_dataset.copy()
        useful_test_data = self.test_dataset.copy()

        useful_data = useful_data.drop(["Div","Date"],axis=1)
        useful_test_data = useful_test_data.drop(["Div","Date"],axis=1)
        
        useful_data = useful_data.drop(["HTR","Referee"],1)
        useful_data["Result"] = useful_data.apply(lambda row: self.encode(row),axis=1)

        useful_test_data = useful_test_data.drop(["HTR","Referee"],1)
        useful_test_data["Result"] = useful_test_data.apply(lambda row: self.encode(row),axis=1)
        
        self.X_train = useful_data[['FTHG','FTAG','HTHG','HTAG','HS','AS','HST','HF','AF','HY','AY','HR','AR','HC','AC','AST']]
        self.y_train = useful_data['Result']

        self.X_test = useful_test_data[['FTHG','FTAG','HTHG','HTAG','HS','AS','HST','HF','AF','HY','AY','HR','AR','HC','AC','AST']]
        self.y_test = useful_test_data['Result']
    
    def encode(self,record):
        """Encode record data.

        Args:
            record (number): _description_

        Returns:
            number: 1, -1 or 0
        """
        
        if(record.FTR == 'H'):
            return 1
        elif(record.FTR == 'A'):
            return -1
        else:
            return 0 
    
    def splited_data(self):
        """Split data.
        
        Returns:
            list: [X_train,X_test,y_train,y_test]
        """
        return[self.X_train,self.X_test,self.y_train,self.y_test]