﻿// helper function to see if a string only has ascii characters in it
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function getTag(tagIndex) {
    var attr = TAG_DICT[tagIndex];
    return attr;
}

function getTagIndex(dcmtag) {
    var group = dcmtag.substring(1, 5);
    var dcmelement = dcmtag.substring(5, 9);
    var ti = ("(" + group + "," + dcmelement + ")").toUpperCase();
    return ti;
}

// This function iterates through dataSet recursively and adds new HTML strings
// to the output array passed into it
function dumpDataSet(dataSet, output) {
    // the dataSet.elements object contains properties for each element parsed.  The name of the property
    // is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
    // element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
    // be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
    // contents to add to the output array
    for (var propertyName in dataSet.elements) {
        var element = dataSet.elements[propertyName];

        var text = "";

        var color = 'black';

        var tagIndex = getTagIndex(element.tag);
        var tag = getTag(tagIndex);
        var name = "Private";
        var vr1 = "??";

        // The output string begins with the element name (or tag if not in data dictionary), length and VR (if present).  VR is undefined for
        // implicit transfer syntaxes
        if (tag === undefined) {
            name = "Private";
            vr1 = "??";
            // make text lighter since this is an unknown attribute
            color = '#C8C8C8';
        } else {
            name = tag.name;
            vr1 = tag.vr;
        }
            
        text += '<span class="btn btn-success">' + tagIndex + '</span>&nbsp;'; //
        text += '<span class="btn btn-success">' + vr1 + '</span>&nbsp;'; //
        text += '<span class="btn btn-default">' + name + '</span>&nbsp;';
        
        // Here we check for Sequence items and iterate over them if present.  items will not be set in the
        // element object for elements that don't have SQ VR type.  Note that implicit little endian
        // sequences will are currently not parsed.
        if (element.items) {
            output.push('<li>' + text + '</li>');
            output.push('<ul>');

            // each item contains its own data set so we iterate over the items
            // and recursively call this function
            var itemNumber = 0;
            element.items.forEach(function (item) {
                output.push('<li>Item #' + itemNumber++ + '</li>');
                output.push('<ul>');
                dumpDataSet(item.dataSet, output);
                output.push('</ul>');
            });
            output.push('</ul>');
        }
        else {
            // use VR to display the right value
            var vr;
            if (element.vr !== undefined) {
                vr = element.vr;
            }
            else {
                if (tag !== undefined) {
                    vr = tag.vr;
                }
            }

            // if the length of the element is less than 128 we try to show it.  We put this check in
            // to avoid displaying large strings which makes it harder to use.
            if (element.length < 128) {
                // Since the dataset might be encoded using implicit transfer syntax and we aren't using
                // a data dictionary, we need some simple logic to figure out what data types these
                // elements might be.  Since the dataset might also be explicit we could be switch on the
                // VR and do a better job on this, perhaps we can do that in another example

                // First we check to see if the element's length is appropriate for a UI or US VR.
                // US is an important type because it is used for the
                // image Rows and Columns so that is why those are assumed over other VR types.
                var str;
                if (element.vr === undefined && tag === undefined) {
                    if (element.length === 2) {
                        text += " (" + dataSet.uint16(propertyName) + ")";
                    }
                    else if (element.length === 4) {
                        text += " (" + dataSet.uint32(propertyName) + ")";
                    }


                    // Next we ask the dataset to give us the element's data in string form.  Most elements are
                    // strings but some aren't so we do a quick check to make sure it actually has all ascii
                    // characters so we know it is reasonable to display it.
                    str = dataSet.string(propertyName);
                    var stringIsAscii = isASCII(str);

                    if (stringIsAscii) {
                        // the string will be undefined if the element is present but has no data
                        // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                        // data.  Note that the length of the element will be 0 to indicate "no data"
                        // so we don't put anything here for the value in that case.
                        if (str !== undefined) {
                            text += '"' + str + '"';
                        }
                    }
                    else {
                        if (element.length !== 2 && element.length !== 4) {
                            color = '#C8C8C8';
                            // If it is some other length and we have no string
                            text += "<i>binary data</i>";
                        }
                    }
                }
                else {
                    function isStringVr(vr1) {
                        if (vr === 'AT'
                                || vr1 === 'FL'
                                || vr1 === 'FD'
                                || vr1 === 'OB'
                                || vr1 === 'OF'
                                || vr1 === 'OW'
                                || vr1 === 'SI'
                                || vr1 === 'SQ'
                                || vr1 === 'SS'
                                || vr1 === 'UL'
                                || vr1 === 'US'
                                ) {
                            return false;
                        }
                        return true;
                    }

                    if (isStringVr(vr)) {
                        // Next we ask the dataset to give us the element's data in string form.  Most elements are
                        // strings but some aren't so we do a quick check to make sure it actually has all ascii
                        // characters so we know it is reasonable to display it.
                        str = dataSet.string(propertyName);
                        stringIsAscii = isASCII(str);

                        if (stringIsAscii) {
                            // the string will be undefined if the element is present but has no data
                            // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                            // data.  Note that the length of the element will be 0 to indicate "no data"
                            // so we don't put anything here for the value in that case.
                            if (str !== undefined) {
                                text += '"' + str + '"';
                            }
                        }
                        else {
                            if (element.length !== 2 && element.length !== 4) {
                                color = '#C8C8C8';
                                // If it is some other length and we have no string
                                text += "<i>binary data</i>";
                            }
                        }
                    }
                    else if (vr == 'US') {
                        text += dataSet.uint16(propertyName);
                    }
                    else if (vr === 'SS') {
                        text += dataSet.int16(propertyName);
                    }
                    else if (vr == 'UL') {
                        text += dataSet.uint32(propertyName);
                    }
                    else if (vr === 'SL') {
                        text += dataSet.int32(propertyName);
                    }
                    else if (vr == 'FD') {
                        text += dataSet.double(propertyName);
                    }
                    else if (vr == 'FL') {
                        text += dataSet.float(propertyName);
                    }
                    else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
                        color = '#C8C8C8';
                        // If it is some other length and we have no string
                        text += "<i>binary data of length " + element.length + " and VR " + vr + "</i>";
                    }
                    else {
                        // If it is some other length and we have no string
                        text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
                    }
                }

                if (element.length === 0) {
                    color = '#C8C8C8';
                }
            }
            else {
                color = '#C8C8C8';

                // Add text saying the data is too long to show...
                text += "<i>data of length " + element.length + " for VR + " + vr + " too long to show</i>";
            }
        }
        // finally we add the string to our output array surrounded by li elements so it shows up in the
        // DOM as a list
        output.push('<li style="color:' + color + ';">' + text + '</li>');
    }
}

// This function will read the file into memory and then start dumping it
function dumpFile(file) {
    // clear any data currently being displayed as we parse this next file
    //document.getElementById('dropZone').innerHTML = '';
    $('#status').removeClass('alert-warning alert-success alert-danger').addClass('alert-info');
    $('#warnings').empty();
    document.getElementById('statusText').innerHTML = 'Status: Loading file, please wait..';

    var reader = new FileReader();
    reader.onload = function () {
        var arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        var byteArray = new Uint8Array(arrayBuffer);
        var kb = byteArray.length / 1024;
        var mb = kb / 1024;
        var byteStr = mb > 1 ? mb.toFixed(3) + " MB" : kb.toFixed(0) + " KB";
        document.getElementById('statusText').innerHTML = 'Status: Parsing ' + byteStr + ' bytes, please wait..';
        // set a short timeout to do the parse so the DOM has time to update itself with the above message
        setTimeout(function () {

            // Invoke the paresDicom function and get back a DataSet object with the contents
            var dataSet;
            try {
                var start = new Date().getTime();
                dataSet = dicomParser.parseDicom(byteArray);
                // Here we call dumpDataSet to recursively iterate through the DataSet and create an array
                // of strings of the contents.
                var output = [];
                dumpDataSet(dataSet, output);

                // Combine the array of strings into one string and add it to the DOM
                document.getElementById('result').innerHTML = '<ul>' + output.join('') + '</ul>';

                var end = new Date().getTime();
                var time = end - start;
                if (dataSet.warnings.length > 0) {
                    $('#status').removeClass('alert-success alert-info alert-danger').addClass('alert-warning');
                    $('#statusText').html('Status: Warnings encountered while parsing file (file of size ' + byteStr + ' parsed in ' + time + 'ms)');

                    dataSet.warnings.forEach(function (warning) {
                        $("#warnings").append('<li>' + warning + '</li>');
                    });
                }
                else {
                    var pixelData = dataSet.elements.x7fe00010;
                    if (pixelData) {
                        $('#status').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                        $('#statusText').html('Status: Ready (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    }
                    else {
                        $('#status').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                        $('#statusText').html('Status: Ready - no pixel data found (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    }
                }
            }
            catch (err) {
                $('#status').removeClass('alert-success alert-info alert-warning').addClass('alert-danger');
                document.getElementById('statusText').innerHTML = 'Status: Error - ' + err + ' (file of size ' + byteStr + ' )';
            }
        }, 10);
    };

    reader.readAsArrayBuffer(file);
}


// this function gets called once the user drops the file onto the div
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // Get the FileList object that contains the list of files that were dropped
    var files = evt.dataTransfer.files;

    // this UI is only built for a single file so just dump the first one
    dumpFile(files[0]);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

    // Setup the dnd listeners.
var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

