// Simple charting using Chart.js

window.addEventListener('load', function () {
    var ctx = document.getElementById('distribution');
    switch (document.getElementById('question').getAttribute('type')) {
      case 'scale3':     scaleChart(ctx, 3); break;
      case 'scale5':     scaleChart(ctx, 5); break;
      case 'scale10':    scaleChart(ctx, 10);break;
      case 'wordcloud': wordCloudChart(ctx); break;
      default: break;
    }
}, false);


function scaleChart(ctx, numChoices) {
    var answers = Array.from(document.getElementsByClassName('answer'));

    var aggregate = new Array(numChoices);
    for ( var i = 1; i <= numChoices; i++ ) aggregate[i] = 0;
    answers.forEach((answer) => {
        var ans = parseInt(answer.innerHTML);
        aggregate[ans] = aggregate[ans] + 1;
    });

    var labels = [];
    for ( var i = 1; i <= numChoices; i++ ) labels.push(i.toString());

    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Válaszok',
                data: aggregate,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor:     'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}


function wordCloudChart(ctx) {
    var answers = Array.from(document.getElementsByClassName('answer'));
    var words = JSON.parse(document.getElementById('words').value);

    var aggregate = {};
    words.forEach((word) => aggregate[word] = 0);

    answers.forEach((answer) => aggregate[answer.innerHTML] = aggregate[answer.innerHTML] + 1);
    var aggregateArray = [];
    for ( var i = 0; i < words.length; i++ )
        aggregateArray.push(aggregate[words[i]]);

    console.log(aggregateArray);

    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: words,
            datasets: [{
                label: 'Válaszok',
                data: aggregateArray,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor:     'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

