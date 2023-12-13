'use strict';

// Docsify plugin functions
function plugin(hook, vm) {
  hook.beforeEach(function (content) {
    return content;
  });

  hook.afterEach(function (html, next) {
    var mdDom = document.createElement('div');
    mdDom.innerHTML = html;
    var index = location.hash.lastIndexOf('/');
    var relativePath = location.hash.substring(0, index + 1);
    const list = [];
    list.push(...mdDom.getElementsByTagName('p'));
    list.push(...mdDom.getElementsByTagName('li'));
    list.push(...mdDom.getElementsByTagName('td'));
    list.push(...mdDom.getElementsByTagName('th'));

    for (var i = 0; i < list.length; i++) {
      var para = list[i].innerHTML;
      
      // Check for image wikilinks
      const eachParaRes = para.replace(/\!\[\[([^\[\]]+)\]\]/g, function (content) {
        const innerContent = content.replace('![[', '').replace(']]', '');
        const linkAliasSps = innerContent.split('|'); // [link, alias]
        const imagePath = linkAliasSps.length === 2 ? `${linkAliasSps[0].trim()}` : innerContent;
        return `<img src="${imagePath}" alt="${linkAliasSps[1]}" />`;
      });

      // Check for regular wikilinks
      list[i].innerHTML = eachParaRes.replace(/\[\[([^\[\]]+)\]\]/g, function (content) {
        const innerContent = content.replace('[[', '').replace(']]', '');
        const linkAliasSps = innerContent.split('|'); // [link, alias]
        const link = linkAliasSps.length === 2 ? `${linkAliasSps[0].trim()}` : innerContent;
        var hashPath = link;
        var topic = '';
        var showText = innerContent;

        if (link.indexOf('#') != -1) {
          const linkTopicSps = link.split('#'); // link, topic
          hashPath = linkTopicSps[0];
          topic = `?id=${linkTopicSps[1]}`;
          showText = `${linkAliasSps[1].trim()}`;
        }

        if (showText.split('|').length == 2) {
          showText = showText.split('|')[1];
        }

        if (hashPath.indexOf('/') === 0) {
          // absolute path
          return `<a href="#${hashPath}${topic}">${showText}</a>`;
        } else {
          return `<a href="${relativePath}${hashPath}${topic}">${showText}</a>`;
        }
      });
    }

    next(mdDom.innerHTML);
  });
}

if (!window.$docsify) {
  console.error(' 这是一个 docsify 插件，请先引用 docsify 库！');
} else {
  window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins);
}
