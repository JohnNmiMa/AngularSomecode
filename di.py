from app import db, models
from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from datetime import datetime
import os.path
import json
import pdb

g_snipa = {
    'access': models.ACCESS_PUBLIC,
    'title': "Markdown Example",
    'language': 'Markdown (GitHub-flavour)',
    "des": """Introduction:
===

Markdown is easy-to-write plain text format that is converted to structurally valid HTML. Markdown has a simple set of punctuation (markup) characters that are meant to resemble _what they look like_ and is therefore quite suitable for programmers talking about their code. The Markdown used in **SomeCode** is styled to be clean, simple, and clear for the _writing_ about code. The styling is chosen to emphasize **readability** and **structure**, not the display of text for _web publishing_. With practice you will be able to quickly create well structured descriptions of your code.

The following is an example of commonly used Markdown syntax. For more detail read the explanation by [John Gruber](http://daringfireball.net/projects/markdown/syntax).

------------

Headers:
======

# Level 1 header
## Level 2 header
### Level 3 header
#### Level 4 header
##### Level 5 header
###### Level 6 header

#### Bullets & Numbered Lists:

The styling of the bullet and numbered lists in **SomeCode** is very specific. Level one bullet and number symbols are flush left. Although this might seem unintuitive, it is meant to display lists in a concise and clean manner where little screen real estate is wasted.

The bullet and number symbols for levels 2 and 3 are lined up directly under the level one text. Level one bullets are _discs_, level two are _circles_, and level three are _squares_. The first time a numbered list item is used, no matter what level, the symbol is a _decimal_. If a numbered item is used following a decimal list item, it has an _alpha_ symbol. And any numbered item following both a decimal and alpha set of items will have the _roman_ symbol.

_Level 1 list, level 2 bullets, level 3 list and bullets:_

1. This can be a very long sentence, where the words will be forced to wrap on the next line, where the list-style-position should be 'outside'.
2. Item 2
    * sub-bullet - Be sure to indent 3 or more spaces to indent
    * sub-bullet:
        1. sub-sub-number item a
        2. sub-sub-number item b
    * sub-bullet - let's talk about this
      * sub-sub-bullet item a
      * sub-sub-bullet item b

_Level 1 bullets, level 2 list, level 3 bullets and list:_

* This is an unordered list
* Bullet b
    1. sub-number item 1
    2. sub-number item 2
        * sub-bullet 2.a
        * sub-bullet 2.b
    3. Item 3
        1. sub-number item 3.1
        2. sub-number item 3.2

_Level 1 list, level 2 list, level 3 list and bullets:_

1. This is an ordered list
2. Number item 2
   1. sub-number item a
   2. sub-number item b
      1. sub-sub-number item i
      2. sub-sub-number item ii
   3. sub-number item c
      * sub-sub-bullet item a
      * sub-sub-bullet item b

_Level 1 bullets, level 2 bullets, level 3 bullets and list:_

* Bullet a
   + sub-bullet a.a
   + sub-bullet a.b
      - sub-sub-bullet item a.b.a
      - sub-sub-bullet item a.b.b
   + sub-bullet a.c
      1. sub-sub-number list item a.c.1
      1. sub-sub-number list item a.c.2

#### Blockquotes:

>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> > This is a nested blockquote!
>
> Here's some example code - be sure to indent by at least 4 spaces or 1 tab:
>
>     return shell_exec("\echo $input | \$markdown_script\");

#### Code:

HTML uses &lt;pre&gt; blocks to surround code. In Markdown, simply indent every line of the block by at least 4 spaces or 1 tab to produce a &lt;pre&gt; block.

    viewsModule.service('snippetService', [function() {
        var snippetPanelScope = undefined,
        changed = function() {
            if (snippetPanelScope != undefined) {
               snippetPanelScope.$broadcast('snippetPanelModelChanged');
            }
        },
        register = function(scope) {
            snippetPanelScope = scope;
        };

        return {
            // getters/setters

            // Public function
            register:register
        }
    }])

To indicate a span of code, wrap it with backtick quotes (&#96;). Unlike a pre-formatted code block, a code
span indicates code within a normal paragraph. Here is a git command to clone a build: `$ git clone
https://github.com/jettagozoom/Quizalator.git`""",
    "code": """
Introduction:
===

Markdown is easy-to-write plain text format that is converted to structurally valid HTML. Markdown has a simple set of punctuation (markup) characters that are meant to resemble _what they look like_ and is therefore quite suitable for programmers talking about their code. The Markdown used in **SomeCode** is styled to be clean, simple, and clear for the _writing_ about code. The styling is chosen to emphasize **readability** and **structure**, not the display of text for _web publishing_. With practice you will be able to quickly create well structured descriptions of your code.

The following is an example of commonly used Markdown syntax. For more details read the explanation by [John Gruber](http://daringfireball.net/projects/markdown/syntax).

------------

Headers:
======

# Level 1 header
## Level 2 header
### Level 3 header
#### Level 4 header
##### Level 5 header
###### Level 6 header

#### Bullets & Numbered Lists:

The styling of the bullet and numbered lists in **SomeCode** is very specific. Level one bullet and number symbols are flush left. Although this might seem unintuitive, it is meant to display lists in a concise and clean manner where little screen real estate is wasted.

The bullet and number symbols for levels 2 and 3 are lined up directly under the level one text. Level one bullets are _discs_, level two are _circles_, and level three are _squares_. The first time a numbered list item is used, no matter what level, the symbol is a _decimal_. If a numbered item is used following a decimal list item, it has an _alpha_ symbol. And any numbered item following both a decimal and alpha set of items will have the _roman_ symbol.

_Level 1 list, level 2 bullets, level 3 list and bullets:_

1. This can be a very long sentence, where the words will be forced to wrap on the next line, where the list-style-position should be 'outside'.
2. Item 2
 * sub-bullet - Be sure to indent 3 or more spaces to indent
 * sub-bullet:
     1. sub-sub-number item a
     2. sub-sub-number item b
 * sub-bullet - let's talk about this
   * sub-sub-bullet item a
   * sub-sub-bullet item b

_Level 1 bullets, level 2 list, level 3 bullets and list:_

* This is an unordered list
* Bullet b
 1. sub-number item 1
 2. sub-number item 2
     * sub-bullet 2.a
     * sub-bullet 2.b
 3. Item 3
     1. sub-number item 3.1
     2. sub-number item 3.2

_Level 1 list, level 2 list, level 3 list and bullets:_

1. This is an ordered list
2. Number item 2
1. sub-number item a
2. sub-number item b
   1. sub-sub-number item i
   2. sub-sub-number item ii
3. sub-number item c
   * sub-sub-bullet item a
   * sub-sub-bullet item b

_Level 1 bullets, level 2 bullets, level 3 bullets and list:_

* Bullet a
+ sub-bullet a.a
+ sub-bullet a.b
   - sub-sub-bullet item a.b.a
   - sub-sub-bullet item a.b.b
+ sub-bullet a.c
   1. sub-sub-number list item a.c.1
   1. sub-sub-number list item a.c.2

#### Blockquotes:

>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> > This is a nested blockquote!
>
> Here's some example code - be sure to indent by at least 4 spaces or 1 tab:
>
>     return shell_exec(\"echo $input | $markdown_script\");

#### Code:

HTML uses &lt;pre&gt; blocks to surround code. In Markdown, simply indent every line of the block by at least 4 spaces or 1 tab to produce a &lt;pre&gt; block.

 viewsModule.service('snippetService', [function() {
     var snippetPanelScope = undefined,
     changed = function() {
         if (snippetPanelScope != undefined) {
            snippetPanelScope.$broadcast('snippetPanelModelChanged');
         }
     },
     register = function(scope) {
         snippetPanelScope = scope;
     };

     return {
         // getters/setters

         // Public function
         register:register
     }
 }])

To indicate a span of code, wrap it with backtick quotes (&#96;). Unlike a pre-formatted code
block, a code span indicates code within a normal paragraph. Here is a git command to clone a
build: \`$ git clone https://github.com/jettagozoom/Quizalator.git\`"""
}

g_snipb = {
    'access': models.ACCESS_PUBLIC,
    'title': "LESS Example",
    'language': 'LESS',
    "des": "This is a sample of LESS CSS",
    "code": """@import \"../../variables.less\";

 #snippetPanel {
     display:inline-block;
     vertical-align: top;
 }
     #snippetPanel.withTopicPanel {
         padding-left: 15px;
     }

 #snippetContainer {
     //border: 1px solid red;
 }
     .snippet {
         margin-bottom:5px;
         position:relative;
         //border:1px solid red;
     }
         .snippetSelector {
             position:absolute;
             left:0;
             min-width:35px;
             z-index:600;
         }
             .snippetSelector span {
                 color:@icon-color;
             }
             .snippetSelector span:hover {
                 color:@icon-hover-color;
             }

         .snippetContent {
             position:relative;
             padding-left:25px;
             border-radius:10px;
         }
             .snippetPopup {
                 position:absolute;
                 width:100%;
                 height:100%;
                 z-index:700;
                 border-radius:6px;
                 background: rgba(245, 245, 245, 0.3);
             }
                 .snippetPopup div.layout {
                     float:left;
                     margin-left:5px;
                     background-color:#fff !important;
                     cursor: pointer;
                 }
                     .snippetPopup button.layout.snip-it {
                         float:left;
                         color:#fff;
                         //font-family: 'Rochester', cursive;
                         font-family: cursive;
                         font-size:14px;
                         outline: none;
                     }
                     .snippetPopup .layout.toggleLineWrap,
                     .snippetPopup .layout.toggleScroll,
                     .snippetPopup .layout.toggleLineNumbers {
                         margin-top:1px;
                         margin-left:5px;
                         padding:1px 2px;
                         float:left;
                         outline: none;
                     }
                     .snippetPopup .layout.toggleLineWrap {
                         margin-left:10px;
                     }
                         .snippetPopup .layout span {
                             color:darken(@icon-color, 15%);
                         }
                         .snippetPopup .layout.snippetRowLayout span {
                             margin-left:2px;
                         }
                         .snippetPopup .layout.snippetColLayout {
                             margin-left:2px;
                         }
                         .snippetPopup .layout.snippetColLayout span {
                             margin-top:-2px;
                         }
                         .snippetPopup .layout.snippetEdit span {
                             margin-left:10px;
                         }
                         .snippetPopup .layout.snippetDelete span {
                             margin-top:-2px;
                             margin-left:10px;
                         }
                             .snippetPopup .layout.snippetColLayout span.active,
                             .snippetPopup .layout.snippetRowLayout span.active,
                             .snippetPopup .layout.snippetTitleOnlyLayout span.active {
                                 color:@icon-color-active;
                             }
                             .snippetPopup div.layout span:hover {
                                 color:darken(@icon-hover-color, 100%);
                             }
                 .snippetPopup .snippetDelete {
                     margin-left:10px;
                 }

             .snippetTitle {
                 .make-row();
             }
                 .snippetTitle .snippetTitleText {
                     .make-sm-column(12);
                     font-weight:bold;
                     margin: 4px 0;
                 }
             .titleDiv {
                 .make-sm-column(12);
             }
             .titleField {
                 font-weight: bold;
                 font-size: 14px;
                 font-family: inherit;
             }

             /* Snippet description and code textarea fields */
             .snippetTextAreas {
                 .make-row();
             }
                 .snippetTextAreas textarea {
                     margin:5px 0;
                 }

                 /* Snippet description textarea field */
                 .snippetDesText {
                     padding: 5px 0;
                 }
                 .snippetDesStyle {
                     font-family:@des-font-family;
                     font-size: small;
                     margin-bottom:0;
                     background-color:white;
                     line-height:1;
                 }
                 textarea.snippetDesStyle {
                     font-family:@des-font-family;
                     font-size: small;
                 }
                     .snippetDesStyle li {
                         list-style-type: disc;
                     }
                     .snippetDesStyle pre {
                         font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;
                         background-color: transparent;
                         padding:0;
                         margin:0;
                         border:none;
                         line-height:1;
                         overflow:hidden;
                     }
                 .snippetDes-col {
                     .make-sm-column(6);
                     padding-right: 5px;
                 }
                     .snippetDes-col ul {
                         padding-left: 18px;
                     }
                 .snippetDes-row {
                     .make-xs-column(12);
                 }
                     .snippetDes-row ul {
                         padding-left: 18px;
                     }
                 .snippetDes-col .CodeMirror,
                 .snippetDes-row .CodeMirror, {
                     font-family:@des-font-family;
                     font-size: small;
                 }

                 /* Snippet code textarea field */
                 .snippetCodeStyle .CodeMirror {
                     font-family:@code-font-family;
                     font-size: x-small;
                 }
                     .snippetCode-col {
                         .make-sm-column(6);
                         margin-top:5px;
                         padding-left:5px;
                     }
                     .snippetCode-row {
                         .make-xs-column(12);
                     }
                 .snippetCodeStyle.owned .CodeMirror {
                     background-color:@user-snippet-code-color;
                 }
                 .snippetCodeStyle.notOwned .CodeMirror {
                     background-color:@public-snippet-code-color;
                 }
                 .snippetCodeStyle.owned .CodeMirror-gutters {
                     background-color:@user-snippet-code-color;
                 }
                 .snippetCodeStyle.notOwned .CodeMirror-gutters {
                     background-color:@public-snippet-code-color;
                 }
                     .snippetCodeStyle pre {
                         background-color: transparent;
                         padding:0;
                         margin:0;
                         border:none;
                         line-height:1;
                         overflow:hidden;
                     }

                     .CodeMirror {
                         height:auto;
                         min-height:44px;
                         border-radius: 4px;
                         outline: 0;
                         padding:0 5px;
                     }
                     .CodeMirror.isEditing {
                         border: 1px solid #cccccc;
                     }
                     .CodeMirror.CodeMirror-focused {
                         border: 1px solid #cccccc;
                         border-color: #66afe9;
                         outline: 0;
                         -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6);
                         box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6);
                     }
                     .CodeMirror-scroll {
                         max-height:400px;
                         overflow-x:auto;
                     }
                     //.CodeMirror-scroll {
                     //    height:auto;
                     //    overflow-x:auto;
                     //    overflow-y:hidden;
                     //    max-height:none;
                     .CodeMirror-scroll {
                         [contentEditable=true]:empty:not(:focus):before{
                             content:attr(data-ph)
                         }
                     }

             .snippetForm {
                 z-index: 5100;
             }
             #snippetFormBar {
                 .make-row();
             }
                 #snippetFormBar #snippetFormBarContainer {
                     position:relative;
                     margin-bottom:5px;
                     .make-xs-column(12);
                 }
                     .snippetSave, .snippetCancel, .snippetAccess, .languageSelect {
                         float:right;
                         height:24px;
                         border-radius: 4px;
                         font-size:11px;
                         vertical-align: top;
                     }
                     .snippetSave, .snippetCancel, .snippetAccess {
                         border:none;
                     }
                     .snippetSave, .snippetCancel {
                         color:#fff;
                         width:46px;
                         outline: none;
                     }
                     .snippetAccess {
                         margin-right:10px;
                         padding:0;
                         font-size: 14px;
                         color:@icon-color;
                         background-color:#fff;
                     }
                         .snippetAccess:hover {
                             color:darken(@icon-color, 9%);
                         }
                         .snippetAccess:focus {
                             outline:0;
                         }
                     .snippetCancel {
                         margin-right:10px;
                         background-color:@brand-danger;
                     }
                         .snippetCancel:hover {
                             background-color:darken(@brand-danger, 9%);
                         }
                     .snippetSave {
                         background-color:@icon-color-selected;
                     }
                         .snippetSave:hover {
                             background-color:darken(@icon-color-selected, 9%);
                         }
                     .languageSelect {
                         margin-right:10px;
                         padding-left:6px;
                         border-color: #ccc;
                         outline: none !important;
                         background: url(./components/snippetpanel/arrow-down.png) no-repeat right;
                         background-size: 34px 34px;
                         -webkit-appearance: none;
                     }"""
}

g_snipc = {
    'access': models.ACCESS_PUBLIC,
    'title': "HTML Example",
    'language': 'HTML',
    "des": "",
    "code": """<form class='snippetForm' role=\"form\">
     <div class=\"snippetTitle\" ng-if=\"!(isEditing || isAdding)\">
         <h5 class=\"snippetTitleText\">{{snip.title}}</h5>
     </div>
     <div class=\"snippetTitle\" ng-if=\"(isEditing || isAdding)\">
         <div class='titleDiv'>
             <input class='titleField form-control'
                    type=\"text\" name=\"title\" autocomplete=\"off\"
                    autofocus tabindex=\"1\" placeholder=\"Add snippet title here\"
                    ng-model=\"snip.title\">
         </div>
     </div>
     <div id='formContent' class=\"snippetTextAreas\">
         <div ng-show=\"layout != 'titlesonly'\" ng-if=\"!(isEditing || isAdding)\"
              ng-bind-html=\"getTrustedHtml(snip.description)\"
              class=\"snippetDesStyle\"
              ng-class=\"{'snippetDes-col':layout === 'column', 'snippetDes-row':layout === 'row'}\">
         </div>
         <!--<div ng-hide=\"layout === 'titlesonly' || (snip.description === '' && !(isEditing || isAdding))\"-->
         <div ng-hide=\"layout === 'titlesonly'\" ng-if=\"(isEditing || isAdding)\"
              class=\"snippetDesStyle\"
              ng-class=\"{'snippetDes-col':layout === 'column', 'snippetDes-row':layout === 'row'}\">
             <textarea name=\"description\" class=\"form-control\"
                       placeholder=\"Add snippet description here\" tabindex=\"2\"
                       ng-model=\"snip.description\"></textarea>
         </div>
         <div ng-hide=\"layout === 'titlesonly' || (snip.code === '' && !(isEditing || isAdding))\"
              class=\"snippetCodeStyle\"
              ng-class=\"{'snippetCode-col':layout === 'column', 'snippetCode-row':layout === 'row',
                         'owned':    isSnippetOwnedByCurrentUser(snip.creator_id),
                         'notOwned':!isSnippetOwnedByCurrentUser(snip.creator_id)}\">
             <textarea name=\"code\" class=\"form-control\"
                       placeholder=\"Add snippet code here\" tabindex=\"3\"
                       ui-codemirror=\"{ onLoad: codeTextAreaLoaded }\" ui-codemirror-opts=\"codeEditorOptions\"
                       ng-model=\"snip.code\" ui-refresh=\"refreshIt\"></textarea>
         </div>
     </div>
 </form>"""
}

g_snipd = {
    'access': models.ACCESS_PUBLIC,
    'title': "A big long AngularJS Directive",
    'language': 'JavaScript',
    "des": "This is an example of an AngularJS directive. Directives are nice in that they can be used to extend the HTML language to create custom elements or element attributes. Directives can have their own controllers and *link* functions. Directives can have their own private scope, or share the scope of their parent directives.",
    "code": """.directive('snippet', ['$sce', 'snippetBarService', 'oauthLibrary', 'createSnippet', 'editSnippet', 'deleteSnippet', 'snippetLibraryService', 'topicService',
                    function($sce,   snippetBar,          oauth,          createSnippet,   editSnippet,   deleteSnippet,   snippetLibraryService,   topicService) {
         return {
             restrict: 'E',
             scope: true,
             templateUrl: './static/components/snippetpanel/snippet.html',
             controller: ['$scope', '$element', '$attrs',
                  function($scope,   $element,   $attrs) {
                 var snippetUsage = $attrs.snippetUsage;

                 $scope.SnippetDirectiveController = \"SnippetDirectiveController\";
                 $scope.isEditing = false;
                 $scope.isEditingAccess = false;
                 $scope.isAdding = false;
                 $scope.isPreviewing = false;
                 $scope.lineWrapping = false;
                 $scope.lineNumbers = true;
                 if (snippetUsage === 'forAdding') {
                     $scope.lineNumbers = false;
                 }
                 $scope.layout = snippetBar.snippetLayout;

                 $scope.languages = CodeMirror.modeInfo;
                 if (snippetUsage === 'forAdding') {
                     $scope.language = null;
                 } else {
                     $scope.language = $.grep($scope.languages, function(e){ return e.name === $scope.snip.language; })[0];
                 }
             }],
             link: function(scope, element, attrs, snippetCtrl) {
                 var snippetUsage = attrs.snippetUsage,
                     cmElement = element.find('.CodeMirror'),
                     cmScrollElement = element.find('.CodeMirror-scroll'),
                     snippetDeleteDialog = element.find('.snippetDeleteDialog'),
                     tmpSnippetModel = {},
                     addSnippetModel = {title:\"\", code:\"\", description:\"\", language:\"NotChosen\", access:false, creator_id:oauth.userid()},
                     textDecorationNoneStyle = {'text-decoration':'none'},
                     textDecorationLineThroughStyle = {'text-decoration':'line-through'};

                 scope.isScrolling = true;
                 scope.refreshIt = true;
                 scope.scrollStrikeStyle = textDecorationNoneStyle;
                 scope.wrapStrikeStyle = textDecorationLineThroughStyle;
                 scope.lineNumberStrikeStyle = textDecorationNoneStyle;

                 if (snippetUsage === 'forAdding') {
                     scope.snip = {};
                     angular.copy(addSnippetModel, scope.snip);
                 }

                 scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                     return oauth.userid() == creatorId;
                 };

                 scope.getTrustedHtml = function(htmlStr) {
                     return $sce.trustAsHtml(htmlStr);
                 };

                 scope.snippetPopupVisible = false;
                 scope.showSnippetPopup = function() {
                     scope.snippetPopupVisible = true;
                 };
                 scope.hideSnippetPopup = function() {
                     scope.snippetPopupVisible = false;
                 };

                 scope.setLayout = function(layout) {
                     scope.layout = layout;
                 };
                 scope.$on('snippetBarModelChanged', function() {
                     scope.layout = snippetBar.snippetLayout;
                     if (snippetUsage === 'forAdding') {
                         scope.isAdding = snippetBar.isAddingSnippet;
                         if (scope.isAdding) {
                             scope.refreshIt = !scope.refreshIt;
                             scope.codeEditorOptions.readOnly = false;
                         } else {
                             scope.codeEditorOptions.readOnly = 'nocursor';
                         }
                     }
                 });

                 scope.snippetEdit = function(snippet) {
                     angular.copy(snippet, tmpSnippetModel);
                     scope.isEditing = true;
                     scope.isEditingAccess = snippet.access;
                     scope.snippetPopupVisible = false;
                     scope.codeEditorOptions.readOnly = false;
                     cmElement.addClass('isEditing');
                 };
                 scope.snippetCancel = function(snippet) {
                     if (scope.isAdding) {
                         // We must be cancelling a snippet add
                         angular.copy(addSnippetModel, scope.snip);
                         snippetBar.isAddingSnippet = false;
                     } else  if (scope.isEditing) {
                         // We must be cancelling a snippet edit
                         if (scope.language !== tmpSnippetModel.language) {
                             scope.language = $.grep(scope.languages, function(e){
                                 return e.name === tmpSnippetModel.language;
                             })[0];
                         }
                         scope.snip = tmpSnippetModel;
                         tmpSnippetModel = {};
                         scope.isEditing = false;
                         scope.codeEditorOptions.readOnly = 'nocursor';
                         cmElement.removeClass('isEditing');
                     }
                     scope.isEditingAccess = false;
                     scope.isPreviewing = false;
                 };
                 scope.snippetSave = function(snippet) {
                     var topicName = \"General\",
                         selectedTopic = topicService.selectedTopic;

                     // At minimum a snippet title is required
                     if (snippet.title === \"\") {
                         return;
                     }

                     if (scope.language === undefined || scope.language === null || scope.language.name === 'NotChosen') {
                         // If no language was chosen, just set the language to \"NotChosen\" in the backend DB
                         snippet.language = 'NotChosen';
                     } else {
                         snippet.language = scope.language.name;
                     }

                     snippet.access = scope.isEditingAccess;
                     if (scope.isAdding) {
                         if (selectedTopic !== undefined) {
                             topicName = selectedTopic.name;
                         }
                         createSnippet(snippet, topicName).then(function(results) {
                             snippetLibraryService.addSnippet(results, scope);
                             angular.copy(addSnippetModel, scope.snip);
                             snippetBar.isAddingSnippet = false;
                             scope.language = null;
                         });
                     } else  if (scope.isEditing) {
                         editSnippet(snippet).then(function(result) {
                             snippetLibraryService.editSnippet(result, scope);
                             scope.isEditing = false;
                         });
                     }
                     scope.isEditingAccess = false;
                     scope.isPreviewing = false;
                 };
                 scope.initiateSnippetDelete = function(snippet) {
                     // Popup modal to prompt user to see if snippet should really be deleted
                     scope.$broadcast('snippetDeleteEvent', snippet);
                 };
                 scope.snippetDelete = function(snippet) {
                     deleteSnippet(snippet).then(function(results) {
                         snippetLibraryService.deleteSnippet(results, scope);
                         scope.snippetPopupVisible = false;
                         scope.isEditing = false;
                         // Hide the snippet delete dialog
                         snippetDeleteDialog.modal('hide');
                     });
                 };

                 scope.toggleLineWrap = function() {
                     scope.lineWrapping = !scope.lineWrapping;
                     scope.wrapStrikeStyle =
                         scope.lineWrapping ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                     if (scope.lineWrapping) {
                         scope.codeEditorOptions.lineWrapping = true;
                     } else {
                         scope.codeEditorOptions.lineWrapping = false;
                     }
                 };

                 scope.toggleLineNumbers = function() {
                     scope.lineNumbers = !scope.lineNumbers;
                     scope.codeEditorOptions.lineNumbers = scope.lineNumbers;
                     scope.lineNumberStrikeStyle =
                         scope.lineNumbers ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                 };

                 scope.toggleScroll = function() {
                     scope.isScrolling = !scope.isScrolling;
                     scope.scrollStrikeStyle =
                         scope.isScrolling ? textDecorationNoneStyle : textDecorationLineThroughStyle;
                     if (scope.isScrolling) {
                         // Set CodeMirror scroll element to scroll in window of max-height = 400px
                         cmScrollElement.css({
                             'overflow':'auto',
                             'max-height':'400px'
                         });
                     } else {
                         // Set CodeMirror scroll element to expand to code size
                         cmScrollElement.css({
                             'overflow-x':'auto',
                             'overflow-y':'hidden',
                             'height':'auto',
                             'max-height':'none'
                         });
                     }
                     scope.refreshIt = !scope.refreshIt;
                 };

                 scope.toggleSnippetAccess = function(snippet) {
                     scope.isEditingAccess = !scope.isEditingAccess;
                 };

                 scope.togglePreview = function() {
                     scope.isPreviewing = !scope.isPreviewing;
                 };
             }
         }
     }])"""
}

g_snipe = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Class Definition',
    'language': 'Python',
    "des": """Classes are used to create user defined datatypes.

            1. By convention, they are capitalized.
            1. A class is a python object, and is a template used to create class instances. A class instance
               is created by instantiation *(inst = class()*).
            1. Classes can have docstrings.
            1. Use the *pass* statement to define a null class.""",
    "code": """class Dog:
\"\"\" This is a docstring for the Dog class. \"\"\"
    pass
>>> d = Dog()
>>> Dog.__doc__
>>> ' This is a docstring for the Dog class. '"""
}
g_snipe = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Class Variables',
    'language': 'Python',
    "des": """Class variables in python are shared among all of the class instances:

1. If you change the class variable with the class object (class.attr = value), the value is
   changed in all existing and future class instances *(Dog.sound = 'yip')*.
1. If you change the variable through a class instance *(big_dog.sound = 'growl')* a local variable
   is created for that instance and added to the instance's dictionary.""",
    "code":"""class Dog:
    sound = 'bark'
>>> print Dog.sound
bark
>>> big_dog = Dog()
>>> small_dog = Dog()
>>> print big_dog.sound, small_dog.sound 
bark bark
>>> Dog.sound = 'yip'
>>> print big_dog.sound, small_dog.sound 
yip yip
>>> big_dog.sound = 'growl'
>>> print big_dog.sound, small_dog.sound 
growl yip"""
}
g_snipf = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Built-in Attributes',
    'language': 'Python',
    "des": """Class Attributes:

1. __dict__ Dictionary containing the class's namespace
1. __doc__ The docstring - set to *None* if undefined
1. __name__ Class name
1. __module__ Module name in which the class is defined - is "__main__" in interactive mode
1. __bases__ A tuple containing the base classes

Instance Attributes:

1. __dict__ Dictionary containing the instances's namespace
1. __class__ Name of the instance's class""",
    "code": ""
}
g_snippets = [g_snipf, g_snipe, g_snipd, g_snipc, g_snipb, g_snipa]

w_snipt = {
    'access': models.ACCESS_PUBLIC,
    'title': "",
    'language': 'Python',
    "des": "",
    "code": ""
}

w_snipa = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Welcome to SomeCode',
    'language': 'Language',
    "des": """*SomeCode* is a code snippet service for coders. Store your code here, search for other developer's code, and save personally created snippets or those created by others to one of your snippet topics.

Yes, snippets can be stored in buckets (topics) to facilitate snippet organization. Create subject areas (jQuery, Python OO, C++ OO etc.) or other topics to store chunks of code or notes you wish to reference some time later.""",
    "code": ''
}
w_snipb = {
    'access': models.ACCESS_PUBLIC,
    'title': 'When logged out, you can search for all public snippets in the SomeCode Cloud',
    'language': 'Language',
    "des": """Users without a *SomeCode* account can search any public snippet. The number of public snippets that can be searched is visible in the snippet search bar. It is envisioned, that over time as the *SomeCode* database grows and matures, snippet information will become a valuable resource, available to all serious coders. Click the public search selector and enter the word 'python' to give it a try. And enter the word *Markdown* to learn more about using Markdown in *SomeCode*.""",
    "code": ''
}
w_snipc = {
    'access': models.ACCESS_PUBLIC,
    'title': "When logged in, you can search public and personal snippets",
    'language': 'Language',
    "des": """Click the 'personal' search badge to search all snippets contained in any of the user's topics, or click the 'public' search badge to search all public snippets.

Code snippets created by the currently logged in user are colored differently than snippets created by other users. This allows the user to quickly observe all personally authored snippets from the entire collection of snippets on the page. NOTE: only the 'code' text is colored differently.""",
    "code": ''
}
w_snipd = {
    'access': models.ACCESS_PUBLIC,
    'title': "Snippets in a topic can be displayed with the click of a button",
    'language': 'Language',
    "des": """Click on the topic name and all snippets in the topic will be displayed. Only the snippet display area of the page is updated and does not require a full page refresh. This provides a clean, snappy user experience without annoying page refreshes.""",
    "code": ''
}
w_snipe = {
    'access': models.ACCESS_PUBLIC,
    'title': "When logged in, you can create, edit, or delete snippets and snippet topics",
    'language': 'Language',
    "des": """Snippets and snippet topics can be created, edited, and deleted. To create, just click the Snippet Add (plus) icon in the snippet panel, or click the Topic Add (plus) icon in the topic panel. Each snippet has a snippet selector where the snippet can be edited or deleted. Just hover over the snippet selector (eye) to pop up the selector bar, and then click the edit or delete icon.

All *SomeCode* accounts include a 'General' topic. Snippets not associated with a topic when created go into the General topic. And all snippets in a topic that is deleted will be moved to the General topic.

To add a snippet to a snippet topic, first select a topic by clicking on the topic name. Next, click the snippet add icon and enter the snippet contents. Click 'Save' and the new snippet will be added to the currently selected topic.

Each snippet has three main parts - the *title*, *description*, and *code*. The title is required whereas the description and code are optional. To quickly create multiple snippets, just add the titles up front and the description or code can be added later on.

When entering a description or chunk of code, the textarea will grow or shrink as text is added or deleted. Code entered in the code textarea is highlighted according to the syntax of the code's language. The text in the snippet description textarea is Markdown. When entering the description, enter the text in Markdown. To check what the Markdown will look like, click the button in the upper right part of the textarea to preview the description. When the Markdown and code are completed, click the "Save" button.""",
    "code": ''
}
w_snipf = {
    'access': models.ACCESS_PUBLIC,
    'title': "You can hide the Topic Panel by clicking the Topic Panel Toggle Icon",
    'language': 'Language',
    "des": """Clicking the *Topic Panel Toggle Icon* will toggle the visibility of the Topic Panel. Collapsing the Topic Panel out of view will provide more room to display large snippets.""",
    "code": ''
}
w_snipg = {
    'access': models.ACCESS_PUBLIC,
    'title': "You can view the snippets in three ways",
    'language': 'Language',
    "des": """The three different layout options are:

1. *Row* mode, where the snippet description is listed in its own row above the snippet code. This is the best layout when looking at larger snippets.
1. *Columnar* mode, where the snippet description and code are side-by-side. This can be a handy when viewing many short snippets at once. *Columnar* mode will allow for a more dense packing of snippets on the screen.
1. *Title Only* mode, where only the titles of the snippets are shown. This is handy when viewing many snippets at once and then selecting only the snippet of interest. The snippet layout can be changed by clicking on the global or local snippet layout icons.

The three snippets layouts can be controlled in the snippet bar, or individually through the snippet selector. The icon with the vertical line represents *columnar* layout. The icon with the horizontal line is for *row* layout, and the 'empty' icon is for *title only* layout.""",
    "code": ''
}
w_sniph = {
    'access': models.ACCESS_PUBLIC,
    'title': "You can interact with individual snippets",
    'language': 'Language',
    "des": """Hover over the Snippet Selector Icon to perform the following tasks:

1. *Snip It* **(implemented soon)** will allow any public or authored snippet to be saved to any of the user's topics. This will allow a snippet created by another user to be saved into any snippet topic. This is similar to pinning a pin in Pinterest. Just select the topic where the snippet is to reside and it will be visible in that topic.
1. *Scroll* will toggle the textarea of large snippets to scroll or to be displayed entirely on the page.
1. *Wrap* will toggle the text wrapping in the textarea.
1. *Line #* will toggle the line numbers in the code textarea.
1. *Snippet layout* (columnar, row, title-only) can be adjusted.
1. *Edit* the snippet. The snippet title, description, code, public vs personal state, and snippet language can be changed.
1. *Delete* the snippet.""",
    "code": ''
}
w_snipi = {
    'access': models.ACCESS_PUBLIC,
    'title': "Snippets can be public, so others can search and 'Snip It' your snippets.",
    'language': 'Language',
    "des": """*Personal* snippets are shown with the 'Closed-Eye' access icon and *public* snippets are shown with the 'Open-Eye' access icon. To make a snippet *public* simply set the access icon (eye) to the public state when creating or editing snippets. Be careful though, public snippets can be searched and snipped by anyone. And once they are snipped, they can no longer be made personal.""",
    "code": ''
}
w_snipj = {
    'access': models.ACCESS_PUBLIC,
    'title': "Future Functionality",
    'language': 'Language',
    "des": """The application before you came to life as an MVP project in Thinkful's *Programming in Python Python/Flask)* and *AngularJS* class. It was the author's experience that other code snippet tools have a less than useful UX experience, such that when creating a snippet, a full page webform is flashed where the data is to be enter. All other information on the page is locked out and the context in which the new snippet is being placed is blocked. Another weaknesses is the display and layout of the snippets. Only a few snippets are displayed on the page, and the ability to see multiple snippets at once is missing. This application was an attempt to add a better UX experience for the user with the addition of functionality not present in other code snippet tools (e.g.: 'Snip-It', public vs personal snippet searches, authored vs snipped code, multiple snippet layouts,
etc.

To more fully flesh out the application, the following features are envisioned as being useful for
a great 'snippet management' experience:

1. **Allow snippets to move** from one topic to another.
1. **Allow snippets to simultaneously reside in more than one topic**.
1. **Snip or share snippets**. Just as images in Pinterest can be *Pinned*, with *SomeCode* 'Snippets' should be able to be *Snipped*. All public snippets should be able to be snipped. This will require the database to have a many-to-many relationship between a user's topics and the snippets in a topic. In other words, a topic can contain multiple snippets, and a snippet should be able to reside in multiple topics.
1. **Implement the settings dialog** to provide a default snippet layout, default snippet personal/public color, etc.
1. **Implement tooltips** for improved usage and usability.
1. **Sort snippets**, sorting on time, alphabetically, or custom. In custom sort mode, snippets can be dragged up or down into an order that makes sense for the snippet topic. This is one of the weaknesses of Pinterest - pins can not be moved around in the board. With *SomeCode* snippets can be placed in any desired order.
1. **Filter snippets by snippet language**.
1. **Filter snippets by popularity** or number of times snipped.
1. Allow snippets to be **liked**.
1. **Improve snippet layout** so that long snippet descriptions will 'flow' around the snippet code when in columnar mode. This will require a custom (non-Bootstrap) UI.
1. **Implement hierarchical topic levels**. Allow topics to reside inside parent topics.
1. **Improve responsiveness on mobile devices**. At small screen sizes, go into display mode only.
1. **Integrate personal *Gist* snippets into the search feature**.
1. **Optimize search performance.**
1. **Create native mobile apps** for Android, iPhone/iPad, etc.
1. Get user feedback for desired features and enhancements.""",
    "code": ''
}
w_snippets = [w_snipj, w_snipi, w_sniph, w_snipg, w_snipf, w_snipe, w_snipd, w_snipc, w_snipb, w_snipa]

def cs():
    """ Create a snippet """

def create_db():
    db.create_all()
    if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
        api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
        api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    else:
        api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))

scgoog = {'google_id': '113145721600593244417', 'name':'SomeCode', 'email': 'somecodeapp@gmail.com', 'role':models.ROLE_ADMIN}
jfb = {'fb_id': '100002423206916', 'name':'JohnMarksJr', 'email': 'johnmarksjr@gmail.com', 'role':models.ROLE_USER}
jgoog = {'google_id': '106697488228998596996', 'name':'John', 'email': 'johnmarksjr@gmail.com', 'role':models.ROLE_USER}
jtwit = {'twitter_id': '1860746486', 'name':'jettagozoom', 'email': None, 'role':models.ROLE_USER}
#users = [scgoog, jfb, jgoog, jtwit]
users = [scgoog]

def add_users():
    u = None
    for user in users:
        if user['name'] == 'SomeCode':
            u = models.User(fb_id=user['google_id'], name=user['name'], email=user['email'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)
        elif user['name'] == 'JohnMarksJr':
            u = models.User(fb_id=user['fb_id'], name=user['name'], email=user['email'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)
        elif user['name'] == 'John':
            u.google_id = user['google_id']
        elif user['name'] == 'jettagozoom':
            u = models.User(twitter_id=user['twitter_id'], name=user['name'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)

        db.session.commit()


def add_snips():
    add_scsnips()
    user = None
    for user in users:
        u = models.User.query.filter_by(name=user['name']).first()
        if user['name'] == 'SomeCode':
            # SomeCode's snippets must be added first, so we do that above in this function
            #add_scsnips()
            pass
        elif user['name'] == 'JohnMarksJr':
            # Add the 'Welcome' snippets using SomeCode's Welcome snippets
            add_usersnips(u)
        elif user['name'] == 'John':
            pass
        elif user['name'] == 'jettagozoom':
            # Add the 'Welcome' snippets using SomeCode's Welcome snippets
            add_usersnips(u)

def add_scsnips():
    add_wsnips() # add SomeCode's 'Welcome' snippets
    add_gsnips() # add SomeCode's 'General' snippets

def add_wsnips():
    user = models.User.query.filter_by(name='SomeCode').first()
    wt = user.topics.filter_by(topic='Welcome').first()

    # Create and add the 'Welcome' snippets
    for snip in w_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=wt, creator_id=user.id,
                           access=snip['access'], language = snip['language'])
        db.session.add(s)
    db.session.commit()

def add_gsnips():
    # Get the 'General' topic
    user = models.User.query.filter_by(name='SomeCode').first()
    gt = user.topics.filter_by(topic='General').first()

    # Create and add the 'General' snippets
    for snip in g_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=gt, creator_id=user.id,
                           access=snip['access'], language=snip['language'])
        db.session.add(s)
    db.session.commit()

def add_usersnips(user):
    # Get SomeCode's 'Welcome' topic
    #pdb.set_trace()
    sc_user = models.User.query.filter_by(name='SomeCode').first()
    wt = sc_user.topics.filter_by(topic='Welcome').first()
    w_snippets = wt.snippets

    # Get the user's 'Welcome' topic
    gt = user.topics.filter_by(topic='Welcome').first()

    # Add SomeCodes 'Welcome' snippets to the user's 'Welcome' topic.
    snippets = w_snippets.all()
    snippets.reverse()
    for snip in snippets:
        s = models.Snippet(title = snip.title, description = snip.description, code = snip.code,
                           timestamp = datetime.utcnow(), topic=gt, creator_id=user.id,
                           language=snip.language, access=models.ACCESS_PRIVATE)
        db.session.add(s)
    db.session.commit()

def delete_snips():
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='Welcome').first()
    snips = topic.snippets.all()
    for snip in snips:
        db.session.delete(snip)
    db.session.commit()

    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        db.session.delete(snip)
    db.session.commit()

def delete_topic():
    topics = qtopic()
    for topic in topics:
        db.session.delete(topic)
    db.session.commit()

def populate_db():
    create_db()
    add_users()
    add_snips()

def qusers():
    """ Find all users """
    users = models.User.query.all()
    return users
def qtopics():
    """ Find all topics """
    topics = models.Topic.query.all()
    return topics
def qsnips():
    """ Find all of a user's snippets (particular user) - order by timestamp """
    """ This requires a join """
    user = models.User.query.first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        print '*****************'
        print snip
    return snips
def qscsnips():
    """ Find all of a SomeCode's snippets - order by timestamp """
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        print '*****************'
        print snip
    return snips
def scsnips_public():
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        snip.access = models.ACCESS_PUBLIC
        print '*****************'
        print snip
    db.session.commit()
    return snips
def qsnips2():
    """ Find all snippets in db (all users) - no ordering """
    snips = models.Snippet.query.all()
    return snips
def qsnips3():
    """ Find all snippets in db (all users) - order by timestamp """
    snips = models.Snippet.query.order_by(models.Snippet.timestamp.desc()).all()
    return snips

def jsonify_snips():
    """ Create JSON of the snippets """
    snips = models.Snippet.query.all()
    reply = {}
    reply['found'] = 'found'
    for i, snip in enumerate(snips):
        #pdb.set_trace()
        d = dict(title=snip.title, description=snip.description, code=snip.code)
        reply[i] = d
    return json.dumps(reply)

if __name__ == "__main__":
    populate_db()
