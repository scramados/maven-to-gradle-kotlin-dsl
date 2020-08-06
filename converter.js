/**
 * Created by sbernstein on 4/8/15.
 */
function parseAndGenerate(){
    var text = document.getElementById('input').value;

    var parser = new DOMParser();
    var parsedDeps = parser.parseFromString(text, 'text/xml');
    var shouldAddOuterClosure =  parsedDeps.getElementsByTagName('dependencies').length;
    if(!shouldAddOuterClosure){
        text = '<root>' + text + '</root>';
        parsedDeps = parser.parseFromString(text, 'text/xml');
    }
    var depElems = parsedDeps.getElementsByTagName('dependency');
    var grDeps = [];
    for(var i = 0; i < depElems.length; i++) {
        var depElem = depElems[i];
        var scopeElems = depElem.getElementsByTagName('scope');
        var scope = 'implementation';
        if (scopeElems.length && scopeElems[0].innerHTML === 'runtime') {
            scope = 'runtimeOnly';
        } else if (scopeElems.length && scopeElems[0].innerHTML === 'provided') {
            scope = 'compileOnly';
        } else if (scopeElems.length && scopeElems[0].innerHTML === 'test') {
            scope = 'testImplementation';
        }
        var group = depElem.getElementsByTagName('groupId')[0].innerHTML;
        var artifact = depElem.getElementsByTagName('artifactId')[0].innerHTML;
        var versionElems = depElem.getElementsByTagName('version');
        var version = '*';
        if (versionElems.length) {
            version = versionElems[0].innerHTML;
        }
        var excludeString = "";
        var exclusions = depElem.getElementsByTagName('exclusions');
        if(exclusions.length) {
            var exElems = exclusions[0].getElementsByTagName('exclusion');
            for (var ii = 0; ii < exElems.length; ii++) {
                var exclElem = exElems[ii];
                excludeString += "exclude(group = \"" + exclElem.getElementsByTagName('groupId')[0].innerHTML + "\", module = \"" + exclElem.getElementsByTagName('artifactId')[0].innerHTML + "\")\n"
            }
        }
        if(excludeString !== ""){
            grDeps.push(scope + '(' + '"' + group + ":" + artifact + ":" + version + '")' + "{\n" + excludeString + "}");
        } else {
            grDeps.push(scope + '(' + '"' + group + ":" + artifact + ":" + version + '")');
        }
    }
    var grDepsOutput = grDeps.join('\n');
    if(shouldAddOuterClosure){
        grDepsOutput = 'dependencies {\n\t' + grDepsOutput.replace(/\n/g, '\n\t') + '\n}'
    }
    return grDepsOutput;
}

function convert(){
    var ok = document.getElementById('success');
    var empty = document.getElementById('empty');
    var fail = document.getElementById('failed');
    ok.hidden = true;
    empty.hidden = true;
    fail.hidden = true;
    var output = document.getElementById('output');
    try {
        output.value = parseAndGenerate();
        if(output.value){
            ok.hidden = false;
            output.select();
        } else {
            empty.hidden = false;
        }
    }
    catch (err){
        output.value = '';
        fail.hidden = false;
    }

}
