import $ from 'jquery';

$(document).ready(() => {
    $('#save').on('click', e => {
        e.preventDefault();
        saveTask();
    });
    // $('#new-task tbody button').on('click', e => {
    //     e.preventDefault();
    // })
    $('#add-step').on('click', e => {
        e.preventDefault();
        addStep();
    });
    initialize();
});


// gets initial data
function initialize() {
    $.get('/tasks', data => {
        let rows = data.map(({title, description, id}) => {
            console.log('row', title, description, id);
            return $('<tr></tr>').append([
                $('<td></td>').append(
                    $('<a></a>')
                        .attr('role', 'button')
                        .attr('href', '#')
                        .text(title)
                        .on('click', e => {
                            e.preventDefault();
                            selectTask(id);
                    })
                ),
                $('<td></td>').append(description || ""),
            ]);
        });
        console.log('initial data', data, 'rows', rows);
        $('#tasks > tbody').empty().append(rows);
    });
}

function addStep() {
    const steps_length = $('#new-task tbody').children().length;
    function makeDeleteButton(idx) {
        return $('<button></button>').text('Delete').on('click', e => {
            e.preventDefault();
            $('#new-task tbody').children().eq(steps_length).remove();
            // if this was the second to last step, remove the button from the last
            if ($('#new-task tbody').children().length === 1) {
                $('#new-task tbody > tr > td:last-child > button').remove();
            }
        });
    }
    // includes delete button in first element as there is more than 1 step
    if (steps_length === 1) {
        $('#new-task tbody > tr > td:last-child').append(
            makeDeleteButton(0)
        );
    }
    // adds step input fields
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
}

function selectTask(id) {
    
}

function saveTask() {
    let id = $('#task-id').val();
    if (id === "") {
        id = null;
    } else {
        id = parseInt(id);
    }

    const title = $('#new-task > label > input[type="text"]').val();
    let description = $('#new-task > label > textarea').val();
    if (description === "") {
        description = null;
    }

    let steps = [];
    $('#new-task > table > tbody').children().each((_idx, elem) => {
        const tr = $(elem);
        const title = tr.children().eq(0).children().eq(0).val();
        let description = tr.children().eq(1).children().eq(0).val();
        if (description === "") {
            description = null;
        }
        const completed = tr.children().eq(2).children().eq(0).is(':checked');
        steps.push({title, description, completed});
    });
    const task = {title, description, steps};
    if (id) {
        
    } else {
        $.ajax({
            url: '/tasks',
            type: 'POST',
            data: JSON.stringify(task),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: response => {
                console.log('response from post', response);
            }
        });
    }
}
