var uri = '/lookup/';


function formatItem(data) {
    var tbl = '<table class="table table-striped  table-condensed">';
    tbl += "<thead>";
    tbl += "<tr>";
    tbl += "<td>";
    tbl += "Tag";
    tbl += "</td>";
    tbl += "<td>";
    tbl += "<abbr title='Value Multiplicity'>VM</abbr>";
    tbl += "</td>";
    tbl += "<td>";
    tbl += "<abbr title='Value Reprsentation, Click the code for more details.'>VR</abbr>";
    tbl += "</td>";
    tbl += "<td>";
    tbl += "Dictionary Description";
    tbl += "</td>";
    tbl += "</tr>";
    tbl += "</thead>";

    $.each(data, function (i, obj) {
        tbl += "<tr>";

        tbl += "<td>";
        tbl += obj.tag;
        tbl += "</td>";

        tbl += "<td>";
        tbl += obj.vm;
        tbl += "</td>";

        tbl += "<td>";
        var vr = obj.vr;
        if (vr == 'AT' || vr == 'FL' || vr == 'FD' || vr == "SL" || vr == "SS" ||
            vr == 'UL' || vr == 'US' || vr == 'OB' || vr == 'OF'  || vr == 'OW') {
            tbl += vrButtonAdd("btn-danger", vr);
        }
        else if (vr == 'SQ') {
            tbl += vrButtonAdd("btn-warning", vr);
        } else {
            tbl += vrButtonAdd("btn-success", vr);
        }
        tbl += "</td>";
        tbl += "<td>";
        tbl += obj.description;
        tbl += "</td>";
        tbl += "</tr>";
    });
    tbl += "</table>";

    return tbl;
}

function vrButtonAdd(btnType, btnLabel) {
    var t = '<button class="btn %bt% btn-sm" data-toggle="modal" data-target="#vrModal">%lbl%</button>';
    t = t.replace('%bt%', btnType);
    t = t.replace('%lbl%', btnLabel);
    return t;
}

function find() {
    var id = $('#tag').val();
    $.getJSON(uri + id)
        .done(function (data) {
            $('#result').html(formatItem(data));
        })
        .fail(function (jqXHR, textStatus, err) {
            $('#result').text('Error: ' + err);
        });
}

$(document).ready(function () {
    $('#tag').keypress(function (e) {
        if (e.keyCode == 13)
            find();
    });
});
