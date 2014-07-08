﻿var uri = '/lookup/';

function formatItem(data) {
    var tbl = '<table class="table table-striped">';
    tbl = tbl + "<thead>";
    tbl = tbl + "<tr>";
    tbl = tbl + "<td>";
    tbl = tbl + "Tag";
    tbl = tbl + "</td>";
    tbl = tbl + "<td>";
    tbl = tbl + "VM";
    tbl = tbl + "</td>";
    tbl = tbl + "<td>";
    tbl = tbl + "<a href='/Home/Vr'>VR</a>";
    tbl = tbl + "</td>";
    tbl = tbl + "<td>";
    tbl = tbl + "Official Description";
    tbl = tbl + "</td>";
    tbl = tbl + "</tr>";
    tbl = tbl + "</thead>";

    $.each(data, function (i, obj) {
        tbl = tbl + "<tr>";

        tbl = tbl + "<td>";
        tbl = tbl + obj.tag;
        tbl = tbl + "</td>";

        tbl = tbl + "<td>";
        tbl = tbl + obj.vm;
        tbl = tbl + "</td>";

        tbl = tbl + "<td>";
        tbl = tbl + "<a href='/Home/Vr' target='_blank'>" + obj.vr + "</a>";
        tbl = tbl + "</td>";
        tbl = tbl + "<td>";
        tbl = tbl + obj.description;
        tbl = tbl + "</td>";
        tbl = tbl + "</tr>";
    });
    tbl = tbl + "</table>";

    return tbl;
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
