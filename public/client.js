import $ from 'jquery';

$(document).ready(() => {
    $('#new-task button').on('click', function(e) {
        e.preventDefault();
    });

    // gets initial data
    $.get('/tasks', data => {
        $('#tasks > tbody').empty().append(data.map(row =>
            $('<tr></tr>').append([
                $('<td></td>').text(
                    $('<button></button>')
                        .text(row.title)
                ),
                $('<td></td>').text(row.description | ""),
            ])
        ));
    });
});
