// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.

var searchBaseURL = 'https://api.addsearch.com/v1/search/a7b957b7a8f57f4cc544c54f289611c6?term=';

var firstURL = '';

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // re-initialize firstURL on empty text
    if (text == '') {firstURL = '';}

    fetch(searchBaseURL+text)
      .then((resp) => resp.json())
      .then(function(data) {
        var suggestResult = [];
        for (var i in data.hits) {
          var hit = data.hits[i];
          var desc = hit.title + ' | <dim>' + hit.meta_description + '</dim>';

          // The first/top result will be the default url
          // if no suggestion was selected
          if (i == 1) {
            firstURL = hit.url;
            chrome.omnibox.setDefaultSuggestion({ description: desc })
          }

          suggestResult.push({
            content: hit.title + ' (' + hit.url + ')',
            description: desc
          });
        }

        suggest(suggestResult);
      })
      .catch(function(error) {
        console.log(error);
      })
  });

chrome.omnibox.onInputEntered.addListener(function(text) {
  var match = text.match(/\((.*)\)$/);
  var url = match != null ? match[1] : firstURL;
  if (url == null) {url = firstURL}

  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    var index = tab[0].index;
    if (tab[0].url == 'chrome://newtab/') {
      chrome.tabs.update(tab[0].id, {url: url})
    } else {
      chrome.tabs.create({ url: url, index: index+1 });
    }
   });
})
