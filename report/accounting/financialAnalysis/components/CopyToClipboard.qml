import QtQuick 2.14

/**
 * The component CopyToClibpoard enable you to
 * copy some text to the clipboard.
 *
 * Usage:
 * ...
 * CopyToClipboard {
 *    id: copyToClipboard
 * }
 * ...
 * copyToClipboard.copyToClipboard(text)
 * ...
 *
 */
TextEdit {
   visible: false

   function copyToClipboard(text, msg) {
      this.text = text
      selectAll()
      copy()
   }
}
