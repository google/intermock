(window.webpackJsonp=window.webpackJsonp||[]).push([[56],{1417:function(e,t,n){"use strict";n.r(t);var o,r,i,a=function(){function e(e,t){var n=this;this._modeId=e,this._defaults=t,this._worker=null,this._idleCheckInterval=setInterval(function(){return n._checkIfIdle()},3e4),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(function(){return n._stopWorker()})}return e.prototype._stopWorker=function(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null},e.prototype.dispose=function(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()},e.prototype._checkIfIdle=function(){if(this._worker){var e=this._defaults.getWorkerMaxIdleTime(),t=Date.now()-this._lastUsedTime;0<e&&e<t&&this._stopWorker()}},e.prototype._getClient=function(){var t=this;if(this._lastUsedTime=Date.now(),!this._client){this._worker=monaco.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:this._modeId,createData:{compilerOptions:this._defaults.getCompilerOptions(),extraLibs:this._defaults.getExtraLibs()}});var e=this._worker.getProxy();this._defaults.getEagerModelSync()&&(e=e.then(function(e){return t._worker.withSyncedResources(monaco.editor.getModels().filter(function(e){return e.getModeId()===t._modeId}).map(function(e){return e.uri}))})),this._client=e}return this._client},e.prototype.getLanguageServiceWorker=function(){for(var t,n=this,o=[],e=0;e<arguments.length;e++)o[e]=arguments[e];return this._getClient().then(function(e){t=e}).then(function(e){return n._worker.withSyncedResources(o)}).then(function(e){return t})},e}(),s=(o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),u=monaco.Uri,c=monaco.Promise;function l(e){return e?e.map(function(e){return e.text}).join(""):""}(i=r||(r={}))[i.None=0]="None",i[i.Block=1]="Block",i[i.Smart=2]="Smart";var p=function(){function e(e){this._worker=e}return e.prototype._positionToOffset=function(e,t){return monaco.editor.getModel(e).getOffsetAt(t)},e.prototype._offsetToPosition=function(e,t){return monaco.editor.getModel(e).getPositionAt(t)},e.prototype._textSpanToRange=function(e,t){var n=this._offsetToPosition(e,t.start),o=this._offsetToPosition(e,t.start+t.length);return{startLineNumber:n.lineNumber,startColumn:n.column,endLineNumber:o.lineNumber,endColumn:o.column}},e}(),m=function(n){function e(e,o,t){var r=n.call(this,t)||this;r._defaults=e,r._selector=o,r._disposables=[],r._listener=Object.create(null);var i=function(e){if(e.getModeId()===o){var t,n=e.onDidChangeContent(function(){clearTimeout(t),t=setTimeout(function(){return r._doValidate(e.uri)},500)});r._listener[e.uri.toString()]={dispose:function(){n.dispose(),clearTimeout(t)}},r._doValidate(e.uri)}},a=function(e){monaco.editor.setModelMarkers(e,r._selector,[]);var t=e.uri.toString();r._listener[t]&&(r._listener[t].dispose(),delete r._listener[t])};return r._disposables.push(monaco.editor.onDidCreateModel(i)),r._disposables.push(monaco.editor.onWillDisposeModel(a)),r._disposables.push(monaco.editor.onDidChangeModelLanguage(function(e){a(e.model),i(e.model)})),r._disposables.push({dispose:function(){for(var e=0,t=monaco.editor.getModels();e<t.length;e++){var n=t[e];a(n)}}}),r._disposables.push(r._defaults.onDidChange(function(){for(var e=0,t=monaco.editor.getModels();e<t.length;e++){var n=t[e];a(n),i(n)}})),monaco.editor.getModels().forEach(i),r}return s(e,n),e.prototype.dispose=function(){this._disposables.forEach(function(e){return e&&e.dispose()}),this._disposables=[]},e.prototype._doValidate=function(i){var a=this;this._worker(i).then(function(e){if(!monaco.editor.getModel(i))return null;var t=[],n=a._defaults.getDiagnosticsOptions(),o=n.noSyntaxValidation,r=n.noSemanticValidation;return o||t.push(e.getSyntacticDiagnostics(i.toString())),r||t.push(e.getSemanticDiagnostics(i.toString())),c.join(t)}).then(function(e){if(!e||!monaco.editor.getModel(i))return null;var t=e.reduce(function(e,t){return t.concat(e)},[]).map(function(e){return a._convertDiagnostics(i,e)});monaco.editor.setModelMarkers(monaco.editor.getModel(i),a._selector,t)}).then(void 0,function(e){console.error(e)})},e.prototype._convertDiagnostics=function(e,t){var n=this._offsetToPosition(e,t.start),o=n.lineNumber,r=n.column,i=this._offsetToPosition(e,t.start+t.length),a=i.lineNumber,s=i.column;return{severity:monaco.MarkerSeverity.Error,startLineNumber:o,startColumn:r,endLineNumber:a,endColumn:s,message:function(e,t){if("string"==typeof e)return e;for(var n=e,o="",r=0;n;){if(r){o+=t;for(var i=0;i<r;i++)o+="  "}o+=n.messageText,r++,n=n.next}return o}(t.messageText,"\n")}},e}(p),f=function(e){function u(){return null!==e&&e.apply(this,arguments)||this}return s(u,e),Object.defineProperty(u.prototype,"triggerCharacters",{get:function(){return["."]},enumerable:!0,configurable:!0}),u.prototype.provideCompletionItems=function(e,t,n,o){e.getWordUntilPosition(t);var r=e.uri,i=this._positionToOffset(r,t);return this._worker(r).then(function(e){return e.getCompletionsAtPosition(r.toString(),i)}).then(function(e){if(e)return{suggestions:e.entries.map(function(e){return{uri:r,position:t,label:e.name,insertText:e.name,sortText:e.sortText,kind:u.convertKind(e.kind)}})}})},u.prototype.resolveCompletionItem=function(e,t,n,o){var r=this,i=n,a=i.uri,s=i.position;return this._worker(a).then(function(e){return e.getCompletionEntryDetails(a.toString(),r._positionToOffset(a,s),i.label)}).then(function(e){return e?{uri:a,position:s,label:e.name,kind:u.convertKind(e.kind),detail:l(e.displayParts),documentation:{value:l(e.documentation)}}:i})},u.convertKind=function(e){switch(e){case b.primitiveType:case b.keyword:return monaco.languages.CompletionItemKind.Keyword;case b.variable:case b.localVariable:return monaco.languages.CompletionItemKind.Variable;case b.memberVariable:case b.memberGetAccessor:case b.memberSetAccessor:return monaco.languages.CompletionItemKind.Field;case b.function:case b.memberFunction:case b.constructSignature:case b.callSignature:case b.indexSignature:return monaco.languages.CompletionItemKind.Function;case b.enum:return monaco.languages.CompletionItemKind.Enum;case b.module:return monaco.languages.CompletionItemKind.Module;case b.class:return monaco.languages.CompletionItemKind.Class;case b.interface:return monaco.languages.CompletionItemKind.Interface;case b.warning:return monaco.languages.CompletionItemKind.File}return monaco.languages.CompletionItemKind.Property},u}(p),g=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.signatureHelpTriggerCharacters=["(",","],e}return s(e,t),e.prototype.provideSignatureHelp=function(e,t,n){var o=this,r=e.uri;return this._worker(r).then(function(e){return e.getSignatureHelpItems(r.toString(),o._positionToOffset(r,t))}).then(function(e){if(e){var t={activeSignature:e.selectedItemIndex,activeParameter:e.argumentIndex,signatures:[]};return e.items.forEach(function(i){var a={label:"",documentation:null,parameters:[]};a.label+=l(i.prefixDisplayParts),i.parameters.forEach(function(e,t,n){var o=l(e.displayParts),r={label:o,documentation:l(e.documentation)};a.label+=o,a.parameters.push(r),t<n.length-1&&(a.label+=l(i.separatorDisplayParts))}),a.label+=l(i.suffixDisplayParts),t.signatures.push(a)}),t}})},e}(p),d=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideHover=function(e,t,n){var r=this,i=e.uri;return this._worker(i).then(function(e){return e.getQuickInfoAtPosition(i.toString(),r._positionToOffset(i,t))}).then(function(e){if(e){var t=l(e.documentation),n=e.tags?e.tags.map(function(e){var t="*@"+e.name+"*";return e.text?t+(e.text.match(/\r\n|\n/g)?" \n"+e.text:" - "+e.text):t}).join("  \n\n"):"",o=l(e.displayParts);return{range:r._textSpanToRange(i,e.textSpan),contents:[{value:"```js\n"+o+"\n```\n"},{value:t+(n?"\n\n"+n:"")}]}}})},t}(p),h=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideDocumentHighlights=function(e,t,n){var o=this,r=e.uri;return this._worker(r).then(function(e){return e.getOccurrencesAtPosition(r.toString(),o._positionToOffset(r,t))}).then(function(e){if(e)return e.map(function(e){return{range:o._textSpanToRange(r,e.textSpan),kind:e.isWriteAccess?monaco.languages.DocumentHighlightKind.Write:monaco.languages.DocumentHighlightKind.Text}})})},t}(p),v=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideDefinition=function(e,t,n){var a=this,o=e.uri;return this._worker(o).then(function(e){return e.getDefinitionAtPosition(o.toString(),a._positionToOffset(o,t))}).then(function(e){if(e){for(var t=[],n=0,o=e;n<o.length;n++){var r=o[n],i=u.parse(r.fileName);monaco.editor.getModel(i)&&t.push({uri:i,range:a._textSpanToRange(i,r.textSpan)})}return t}})},t}(p),_=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideReferences=function(e,t,n,o){var a=this,r=e.uri;return this._worker(r).then(function(e){return e.getReferencesAtPosition(r.toString(),a._positionToOffset(r,t))}).then(function(e){if(e){for(var t=[],n=0,o=e;n<o.length;n++){var r=o[n],i=u.parse(r.fileName);monaco.editor.getModel(i)&&t.push({uri:i,range:a._textSpanToRange(i,r.textSpan)})}return t}})},t}(p),y=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideDocumentSymbols=function(e,t){var u=this,c=e.uri;return this._worker(c).then(function(e){return e.getNavigationBarItems(c.toString())}).then(function(e){if(e){var s=function(e,t,n){var o={name:t.text,detail:"",kind:S[t.kind]||monaco.languages.SymbolKind.Variable,range:u._textSpanToRange(c,t.spans[0]),selectionRange:u._textSpanToRange(c,t.spans[0]),containerName:n};if(t.childItems&&0<t.childItems.length)for(var r=0,i=t.childItems;r<i.length;r++){var a=i[r];s(e,a,o.name)}e.push(o)},t=[];return e.forEach(function(e){return s(t,e)}),t}})},t}(p),b=function(){function e(){}return e.unknown="",e.keyword="keyword",e.script="script",e.module="module",e.class="class",e.interface="interface",e.type="type",e.enum="enum",e.variable="var",e.localVariable="local var",e.function="function",e.localFunction="local function",e.memberFunction="method",e.memberGetAccessor="getter",e.memberSetAccessor="setter",e.memberVariable="property",e.constructorImplementation="constructor",e.callSignature="call",e.indexSignature="index",e.constructSignature="construct",e.parameter="parameter",e.typeParameter="type parameter",e.primitiveType="primitive type",e.label="label",e.alias="alias",e.const="const",e.let="let",e.warning="warning",e}(),S=Object.create(null);S[b.module]=monaco.languages.SymbolKind.Module,S[b.class]=monaco.languages.SymbolKind.Class,S[b.enum]=monaco.languages.SymbolKind.Enum,S[b.interface]=monaco.languages.SymbolKind.Interface,S[b.memberFunction]=monaco.languages.SymbolKind.Method,S[b.memberVariable]=monaco.languages.SymbolKind.Property,S[b.memberGetAccessor]=monaco.languages.SymbolKind.Property,S[b.memberSetAccessor]=monaco.languages.SymbolKind.Property,S[b.variable]=monaco.languages.SymbolKind.Variable,S[b.const]=monaco.languages.SymbolKind.Variable,S[b.localVariable]=monaco.languages.SymbolKind.Variable,S[b.variable]=monaco.languages.SymbolKind.Variable,S[b.function]=monaco.languages.SymbolKind.Function,S[b.localFunction]=monaco.languages.SymbolKind.Function;var w,k,T=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t._convertOptions=function(e){return{ConvertTabsToSpaces:e.insertSpaces,TabSize:e.tabSize,IndentSize:e.tabSize,IndentStyle:r.Smart,NewLineCharacter:"\n",InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}},t.prototype._convertTextChanges=function(e,t){return{text:t.newText,range:this._textSpanToRange(e,t.span)}},t}(p),I=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),t.prototype.provideDocumentRangeFormattingEdits=function(e,t,n,o){var r=this,i=e.uri;return this._worker(i).then(function(e){return e.getFormattingEditsForRange(i.toString(),r._positionToOffset(i,{lineNumber:t.startLineNumber,column:t.startColumn}),r._positionToOffset(i,{lineNumber:t.endLineNumber,column:t.endColumn}),T._convertOptions(n))}).then(function(e){if(e)return e.map(function(e){return r._convertTextChanges(i,e)})})},t}(T),C=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return s(t,e),Object.defineProperty(t.prototype,"autoFormatTriggerCharacters",{get:function(){return[";","}","\n"]},enumerable:!0,configurable:!0}),t.prototype.provideOnTypeFormattingEdits=function(e,t,n,o,r){var i=this,a=e.uri;return this._worker(a).then(function(e){return e.getFormattingEditsAfterKeystroke(a.toString(),i._positionToOffset(a,t),n,T._convertOptions(o))}).then(function(e){if(e)return e.map(function(e){return i._convertTextChanges(a,e)})})},t}(T);function P(e){k=D(e,"typescript")}function x(e){w=D(e,"javascript")}function O(){return new monaco.Promise(function(e,t){if(!w)return t("JavaScript not registered!");e(w)})}function K(){return new monaco.Promise(function(e,t){if(!k)return t("TypeScript not registered!");e(k)})}function D(e,t){var o=new a(t,e),n=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return o.getLanguageServiceWorker.apply(o,[e].concat(t))};return monaco.languages.registerCompletionItemProvider(t,new f(n)),monaco.languages.registerSignatureHelpProvider(t,new g(n)),monaco.languages.registerHoverProvider(t,new d(n)),monaco.languages.registerDocumentHighlightProvider(t,new h(n)),monaco.languages.registerDefinitionProvider(t,new v(n)),monaco.languages.registerReferenceProvider(t,new _(n)),monaco.languages.registerDocumentSymbolProvider(t,new y(n)),monaco.languages.registerDocumentRangeFormattingEditProvider(t,new I(n)),monaco.languages.registerOnTypeFormattingEditProvider(t,new C(n)),new m(e,t,n),n}n.d(t,"setupTypeScript",function(){return P}),n.d(t,"setupJavaScript",function(){return x}),n.d(t,"getJavaScriptWorker",function(){return O}),n.d(t,"getTypeScriptWorker",function(){return K})}}]);