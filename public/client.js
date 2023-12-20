import $ from 'jquery';

$(document).ready(() => {
    $('#new-task > button').on('click', e => {
        e.preventDefault();
    });
    // $('#new-task tbody button').on('click', e => {
    //     e.preventDefault();
    // })
    $('#new-task > a').on('click', e => {
        e.preventDefault();
        const steps_length = $('#new-task tbody').children().length;
        function makeDeleteButton(idx) {
            return $('<button></button>').text('Delete').on('click', e => {
                e.preventDefault();
                $('#new-task tbody').children().eq(steps_length).remove();
                if ($('#new-task tbody').children().length === 1) {
                    $('#new-task tbody > tr > td:last-child > button').remove();
                }
            });
        }
        if (steps_length === 1) {
            $('#new-task tbody > tr > td:last-child').append(
                makeDeleteButton(0)
            );
        }
        $('#new-task tbody').append(
            $('<tr></tr>').append([
                $('<td></td>').append(
                    $('<input></input>').attr('type','text')
                ),
                $('<td></td>').append(
                    $('<textarea></textarea>')
                ),
                $('<td></td>').append(
                    makeDeleteButton(steps_length)
                )
            ])
        );
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
