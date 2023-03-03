/**
 * 
 * The main app module.
 * @module EPLWinningTeamPredictionsApp
 */
function EPLWinningTeamPredictionsApp(){

    const evaluateBtn = document.querySelector('#evaluate');
    const testBtn = document.querySelector('#test');
    const predictionsBtn = document.querySelector('#predictions');
    const backBtn = document.querySelector('#back-btn');
    
    const evaluationTemplate = document.querySelector("#plost-template");
    const testingTemplate = document.querySelector("#test-template");
    const predictionsTemplate = document.querySelector("#predict-template");

    const fixtureTemplate = document.querySelector(".fixture");
    const fixturePredictionTemplate = document.querySelector(".pred-fixture");

    const knnRocCurve = document.querySelector('#knn-roc-curve');
    const SVMRocCurve = document.querySelector('#svm-roc-curve');
    const RFRocCurve = document.querySelector('#rf-roc-curve');
    const DTRocCurve = document.querySelector('#dt-roc-curve');
    const Scores = document.querySelector('#scores');

    const testingFixturesElm = document.querySelector('#testing-fixtures');
    const predictingFixturesElm = document.querySelector('#predicted-fixtures');

    let fixtures = null;
    
    const cards = document.querySelector('#home-cards');
    
    this.run = () => {
        console.log("App is running...");

        initEventListeners();
    }

    async function fetchEvaluationData(){
        return fetch('/evaluate')
        .then((response) => {
            return response.json();
        }).catch(error => alert("Error Occured !!"));
    };

    async function fetchTestingData(){
        return fetch('/test')
        .then((response)=>{
            return response.json();
        }).catch(error => alert("Error Occured In Testing Data !"));
    };

    async function fetchPredictionsResults(){
        return fetch('/predict')
        .then((response)=>{
            return response.json();
        }).catch(error => alert("Error Occured While Predicting Data !"));
    };

    function initEventListeners(){

        evaluateBtn.addEventListener('click',async (e)=>{
            e.preventDefault();

            toggleHomeCardsDisplay();
            displayTemplate(evaluationTemplate);

            Scores.innerHTML = "";

            data = await fetchEvaluationData();

            knn_plot = data[0][0].data || SafeArray;
            svm_plot = data[1][0].data || SafeArray;
            rf_plot = data[2][0].data || SafeArray;
            dt_plot = data[3][0].data || SafeArray;

            knn_score = data[0][4];
            svm_score = data[1][4];
            rf_score = data[2][4];
            dt_score = data[3][4];

            scoresValues = ["KNN Score : "+knn_score,"SVM Score : "+svm_score,"DT Score : "+dt_score,"RF Score : "+rf_score];

            for(let i=0 ; i<4 ; i++)
            {
                let li = document.createElement("li");
                li.innerHTML = scoresValues[i];
                Scores.appendChild(li);
            }
    
            try{
                Plotly.newPlot(knnRocCurve,knn_plot,data.layout);
                Plotly.newPlot(SVMRocCurve,svm_plot,data.layout);
                Plotly.newPlot(RFRocCurve,rf_plot,data.layout);
                Plotly.newPlot(DTRocCurve,dt_plot,data.layout);

            }catch(error){
                console.log(error);
            }
        });

        testBtn.addEventListener('click',async (e)=>{
            
            toggleHomeCardsDisplay();
            displayTemplate(testingTemplate);

            let data = await fetchTestingData();

            testingFixturesElm.innerHTML = "";

            const homeTeams = data.HomeTeam;
            const awayTeams = data.AwayTeam;
            const trueResult = data["Result"];

            const size = Object.keys(trueResult).length;

            const knnPredictions = data["knn"];
            const svmPredictions = data["svm"];
            const dtPredictions = data["dt"];
            const rfPredictions = data["rf"];

            const knnHomeWinPers = data["knn Home Win %"];
            const knnAwayWinPers = data["knn Away Win %"];
            const knnDrawPers = data["knn Draw %"];

            const svmHomeWinPers = data["svm Home Win %"];
            const svmAwayWinPers = data["svm Away Win %"];
            const svmDrawPers = data["svm Draw %"];

            const dtHomeWinPers = data["dt Home Win %"];
            const dtAwayWinPers = data["dt Away Win %"];
            const dtDrawPers = data["dt Draw %"];

            const rfHomeWinPers = data["rf Home Win %"];
            const rfAwayWinPers = data["rf Away Win %"];
            const rfDrawPers = data["rf Draw %"];

            for(let i=0 ; i<size ; i++){

                let fixture = fixtureTemplate.cloneNode(true);

                fixture.classList.remove("hide");

                let homeTeam = fixture.querySelector(".home");
                let awayTeam = fixture.querySelector(".away");

                let realResult = fixture.querySelector(".fixture-result .real-result");
                let predictedResult = fixture.querySelector(".fixture-result .predicted-result");

                let knnPredictedProbabilities = fixture.querySelector(".fixture-body .knn-result").children;
                let svmPredictedProbabilities = fixture.querySelector(".fixture-body .svm-result").children;
                let rfPredictedProbabilities = fixture.querySelector(".fixture-body .rf-result").children;
                let dtPredictedProbabilities = fixture.querySelector(".fixture-body .dt-result").children;

                homeTeam.innerHTML = homeTeams[i];
                awayTeam.innerHTML = awayTeams[i];

                realResult.innerHTML = trueResult[i];

                if(svmPredictions[i] === 1)
                {
                    predictedResult.innerHTML = "H";
                }

                if(svmPredictions[i] === -1)
                {
                    predictedResult.innerHTML = "A";
                }

                if(svmPredictions[i] === 0)
                {
                    predictedResult.innerHTML = "D";
                }

                knnPredictedProbabilities[1].style.width = Math.floor(knnHomeWinPers[i]*100)+"%";
                knnPredictedProbabilities[2].style.width = Math.floor(knnDrawPers[i]*100)+"%";
                knnPredictedProbabilities[3].style.width = Math.floor(knnAwayWinPers[i]*100)+"%";

                svmPredictedProbabilities[1].style.width = Math.floor(svmHomeWinPers[i]*100)+"%";
                svmPredictedProbabilities[2].style.width = Math.floor(svmDrawPers[i]*100)+"%";
                svmPredictedProbabilities[3].style.width = Math.floor(svmAwayWinPers[i]*100)+"%";

                rfPredictedProbabilities[1].style.width = Math.floor(rfHomeWinPers[i]*100)+"%";
                rfPredictedProbabilities[2].style.width = Math.floor(rfDrawPers[i]*100)+"%";
                rfPredictedProbabilities[3].style.width = Math.floor(rfAwayWinPers[i]*100)+"%";

                dtPredictedProbabilities[1].style.width = Math.floor(dtHomeWinPers[i]*100)+"%";
                dtPredictedProbabilities[2].style.width = Math.floor(dtDrawPers[i]*100)+"%";
                dtPredictedProbabilities[3].style.width = Math.floor(dtAwayWinPers[i]*100)+"%";

                knnPredictedProbabilities[1].innerHTML= Math.floor(knnHomeWinPers[i]*100)+" %";
                knnPredictedProbabilities[2].innerHTML = Math.floor(knnDrawPers[i]*100)+" %";
                knnPredictedProbabilities[3].innerHTML = Math.floor(knnAwayWinPers[i]*100)+" %";

                svmPredictedProbabilities[1].innerHTML = Math.floor(svmHomeWinPers[i]*100)+ " %";
                svmPredictedProbabilities[2].innerHTML = Math.floor(svmDrawPers[i]*100)+ " %";
                svmPredictedProbabilities[3].innerHTML = Math.floor(svmAwayWinPers[i]*100)+ " %";

                rfPredictedProbabilities[1].innerHTML = Math.floor(rfHomeWinPers[i]*100)+ " %";
                rfPredictedProbabilities[2].innerHTML = Math.floor(rfDrawPers[i]*100)+ " %";
                rfPredictedProbabilities[3].innerHTML = Math.floor(rfAwayWinPers[i]*100)+ " %";

                dtPredictedProbabilities[1].innerHTML = Math.floor(dtHomeWinPers[i]*100)+ " %";
                dtPredictedProbabilities[2].innerHTML = Math.floor(dtDrawPers[i]*100)+ " %";
                dtPredictedProbabilities[3].innerHTML = Math.floor(dtAwayWinPers[i]*100)+ " %";

                testingFixturesElm.append(fixture);
            }            
        });

        predictionsBtn.addEventListener('click',async (e)=>{
            toggleHomeCardsDisplay();
            displayTemplate(predictionsTemplate);

            predictingFixturesElm.innerHTML = "";

            let data = await fetchPredictionsResults();

            const homeTeams0 = data.HomeTeam;
            const awayTeams0 = data.AwayTeam;
            const trueResult0 = data["Result"];

            const size = 10;
            const homeTeams = Object.values(homeTeams0).slice(370);
            const awayTeams = Object.values(awayTeams0).slice(370);
            const trueResult = Object.values(trueResult0).slice(370);

            const knnHomeWinPers = Object.values(data["knn Home Win %"]).slice(370);
            const knnAwayWinPers = Object.values(data["knn Away Win %"]).slice(370);
            const knnDrawPers = Object.values(data["knn Draw %"]).slice(370);

            const svmHomeWinPers = Object.values(data["svm Home Win %"]).slice(370);
            const svmAwayWinPers = Object.values(data["svm Away Win %"]).slice(370);
            const svmDrawPers = Object.values(data["svm Draw %"]).slice(370);

            const dtHomeWinPers = Object.values(data["dt Home Win %"]).slice(370);
            const dtAwayWinPers = Object.values(data["dt Away Win %"]).slice(370);
            const dtDrawPers = Object.values(data["dt Draw %"]).slice(370);

            const rfHomeWinPers = Object.values(data["rf Home Win %"]).slice(370);
            const rfAwayWinPers = Object.values(data["rf Away Win %"]).slice(370);
            const rfDrawPers = Object.values(data["rf Draw %"]).slice(370);

            for(let i=0 ; i<size ; i++){

                let fixture = fixturePredictionTemplate.cloneNode(true);

                fixture.classList.remove("hide");

                let homeTeamIcon = fixture.querySelector(".home-icon");
                let awayTeamIcon = fixture.querySelector(".away-icon");

                let realResult = fixture.querySelector(".pred-fixture-result .real-result");

                let knnPredictedProbabilities = fixture.querySelector(".pred-fixture-body .knn-result").children;
                let svmPredictedProbabilities = fixture.querySelector(".pred-fixture-body .svm-result").children;
                let rfPredictedProbabilities = fixture.querySelector(".pred-fixture-body .rf-result").children;
                let dtPredictedProbabilities = fixture.querySelector(".pred-fixture-body .dt-result").children;

                homeTeamIcon.src = "../../public/assets/teams logos/"+homeTeams[i]+".png";
                awayTeamIcon.src = "../../public/assets/teams logos/"+awayTeams[i]+".png";

                realResult.innerHTML = trueResult[i];

                knnPredictedProbabilities[1].style.width = Math.floor(knnHomeWinPers[i]*100)+"%";
                knnPredictedProbabilities[2].style.width = Math.floor(knnDrawPers[i]*100)+"%";
                knnPredictedProbabilities[3].style.width = Math.floor(knnAwayWinPers[i]*100)+"%";

                svmPredictedProbabilities[1].style.width = Math.floor(svmHomeWinPers[i]*100)+"%";
                svmPredictedProbabilities[2].style.width = Math.floor(svmDrawPers[i]*100)+"%";
                svmPredictedProbabilities[3].style.width = Math.floor(svmAwayWinPers[i]*100)+"%";

                rfPredictedProbabilities[1].style.width = Math.floor(rfHomeWinPers[i]*100)+"%";
                rfPredictedProbabilities[2].style.width = Math.floor(rfDrawPers[i]*100)+"%";
                rfPredictedProbabilities[3].style.width = Math.floor(rfAwayWinPers[i]*100)+"%";

                dtPredictedProbabilities[1].style.width = Math.floor(dtHomeWinPers[i]*100)+"%";
                dtPredictedProbabilities[2].style.width = Math.floor(dtDrawPers[i]*100)+"%";
                dtPredictedProbabilities[3].style.width = Math.floor(dtAwayWinPers[i]*100)+"%";

                knnPredictedProbabilities[1].innerHTML= Math.floor(knnHomeWinPers[i]*100)+" %";
                knnPredictedProbabilities[2].innerHTML = Math.floor(knnDrawPers[i]*100)+" %";
                knnPredictedProbabilities[3].innerHTML = Math.floor(knnAwayWinPers[i]*100)+" %";

                svmPredictedProbabilities[1].innerHTML = Math.floor(svmHomeWinPers[i]*100)+ " %";
                svmPredictedProbabilities[2].innerHTML = Math.floor(svmDrawPers[i]*100)+ " %";
                svmPredictedProbabilities[3].innerHTML = Math.floor(svmAwayWinPers[i]*100)+ " %";

                rfPredictedProbabilities[1].innerHTML = Math.floor(rfHomeWinPers[i]*100)+ " %";
                rfPredictedProbabilities[2].innerHTML = Math.floor(rfDrawPers[i]*100)+ " %";
                rfPredictedProbabilities[3].innerHTML = Math.floor(rfAwayWinPers[i]*100)+ " %";

                dtPredictedProbabilities[1].innerHTML = Math.floor(dtHomeWinPers[i]*100)+ " %";
                dtPredictedProbabilities[2].innerHTML = Math.floor(dtDrawPers[i]*100)+ " %";
                dtPredictedProbabilities[3].innerHTML = Math.floor(dtAwayWinPers[i]*100)+ " %";

                predictingFixturesElm.append(fixture);
            }

            fixtures = document.querySelectorAll('#predicted-fixtures .pred-fixture');

            if(fixtures !== null)
            fixtures.forEach(fixture => {
    
                console.log(fixture);
    
                fixture.addEventListener('click',(e)=>{
                    
                    let element = fixture.querySelector('.pred-fixture-body');
                    let res = fixture.querySelector('.pred-fixture-result');

                    element.classList.toggle('hide');
                    res.classList.toggle('hide');
                });
            });
        });

        backBtn.addEventListener('click',(e)=>{
            let nextSibling = document.querySelector('#home-cards').nextElementSibling;

            while(nextSibling){

                if(!nextSibling.classList.contains("hide")){
                    nextSibling.classList.add("hide");
                }

                nextSibling = nextSibling.nextElementSibling;
            }
            
            toggleHomeCardsDisplay();
        });
    }

    function toggleHomeCardsDisplay(){

        cards.classList.toggle("fade-bottom");
        
        window.setTimeout(()=>{
            backBtn.classList.toggle('hide');
            cards.classList.toggle("hide");
        },1000);

        window.clearTimeout(1000);
    };

    function displayTemplate(template){
        window.setTimeout(()=>{
            template.classList.remove("hide");
        },1000);
    };
}

const setup = () => {
    window.onload = (e) => {
        window.app = new EPLWinningTeamPredictionsApp();
        window.app.run();
    }
}

setup();