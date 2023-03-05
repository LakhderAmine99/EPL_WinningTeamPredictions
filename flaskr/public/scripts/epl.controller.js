/**
 * 
 */
class EPLController {

    constructor(){}

    /**
     * 
     * @returns 
     */
    async requestEvaluationData(){

        return fetch('/evaluate')
        .then((response) => {
            return response.json();
        }).catch(error => alert("Error Occured !!"));
    }

    /**
     * 
     * @returns 
     */
    async requestTestingData(){

        return fetch('/test')
        .then((response)=>{
            return response.json();
        }).catch(error => alert("Error Occured In Testing Data !"));
    }

    /**
     * 
     * @returns 
     */
    async requestPredictionData(){

        return fetch('/predict')
        .then((response)=>{
            return response.json();
        }).catch(error => alert("Error Occured While Predicting Data !"));
    }
}

export default new EPLController();