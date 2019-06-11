const yaml = require('js-yaml');
// const moment = require('moment');

// According to YAML spec, '---' divide parts of document (config, content),
// and '...' (or '* * *') divide whole documents (notes)

function parseNotes(text, notesConfig = {}) {
  let lastTopic = notesConfig.topic;
  return text.trim()
    .split(/^\.\.\.\s*$|\s*\* \* \*\s*$/gm)
    .map(part => part.trim())
    .filter(part => part)
    .map((raw) => {
      const parts = raw
        .split(/^---\s*$/gm)
        .map(part => part.trim());
      const content = parts.slice(-1)[0];
      const config = yaml.safeLoad(parts.slice(-2, -1)[0] || '') || {};
      if (config.topic) {
        lastTopic = config.topic;
      } else if (lastTopic) {
        config.topic = lastTopic;
      }
      return {
        config: Object.assign({}, notesConfig, config),
        content: content || '',
      };
    });
}

function stringifyNotes(notes) {
  return (Array.isArray(notes) ? notes : [notes]).map((note) => {
    const config = note.config ? `---\n${yaml.safeDump(note.config)}---\n` : '';
    const content = note.content || '';
    return `${config}${content}`;
  }).join('\n\n...\n');
}

module.exports = {
  parse: parseNotes,
  stringify: stringifyNotes,
};
