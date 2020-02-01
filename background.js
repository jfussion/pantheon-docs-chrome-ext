// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.

var searchBaseURL = 'https://api.addsearch.com/v1/search/a7b957b7a8f57f4cc544c54f289611c6?term='

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    fetch(searchBaseURL+text)
      .then((resp) => resp.json())
      .then(function(data) {
        var suggestResult = [];
        for (var i in data.hits) {
          var hit = data.hits[i];
          suggestResult.push({
            content: hit.title + ' (' + hit.url + ')',
            description: hit.title + ' | <dim>' + hit.meta_description + '</dim>'
          });
        }

        suggest(suggestResult);
      })
      .catch(function(error) {
        console.log(error);
      })
  });

chrome.omnibox.onInputEntered.addListener(function(text) {
  var url = text.match(/\((.*)\)$/)[1];
  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      var index = tab[0].index

      chrome.tabs.create({ url: url, index: index+1 });
    });
})
