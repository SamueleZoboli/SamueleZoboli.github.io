// read "content/papers/json" which contains a list of directories


var template = `<div class="row paper-item" style="position: relative; width: auto; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(0, 0, 0, 0.05)">
<div class="col-12">
    <p style="font-weight: 700; font-size: 18px; margin-bottom: 4px; line-height: 1.3">{paper_title}</p>
    <p style="font-size: small; margin-bottom: 6px; line-height: 1.4"> {paper_venue} - {date} <br/> <span class="text-muted"> {paper_authors}</span></p>
    <div class="btn-links" style="margin-top: 0; display: flex; flex-wrap: wrap; gap: 6px 10px">
        {buttons}
    </div>
</div>
</div>`


function create_buttons(data) {
    var buttons = "";
    // Hide PDF button if the paper has the "thesis" tag
    if (!data["tags"].includes("thesis")) {
        if (data["url_pdf"] !== "") {
            buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_pdf"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Paper</a>`
        } else {
            //make the pdf button disabled
            buttons += `<a class="btn btn-outline-primary btn-sm disabled" href="" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Paper</a>`
        }
    }
    if (data["url_code"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_code"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Code</a>`
    }
    if (data["url_dataset"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_dataset"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Dataset</a>`
    }
    if (data["url_poster"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_poster"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Poster</a>`
    }
    if (data["url_project"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_project"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Project</a>`
    }
    if (data["url_source"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_source"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Source Document</a>`
    }
    if (data["url_video"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_video"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Video</a>`
    }
    if (data["url_hal"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_hal"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">HAL</a>`
    }
    return buttons;
}

function create_cite_button(folder_name, submitted) {
    // Read the bibtex file as a string
    var bibtex_file = "/content/" + folder_name + "/cite.bib";
    if (submitted) {
        // the button is disabled
        return `<button type="button" class="btn btn-outline-primary btn-page-header btn-sm disabled" data-toggle="modal" data-target="#exampleModal" data-folder="${bibtex_file}">Cite</button>`;
    } else {
        return `<button type="button" class="btn btn-outline-primary btn-page-header btn-sm" data-toggle="modal" data-target="#exampleModal" data-folder="${bibtex_file}">Cite</button>`;
    }
}


$('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('folder') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    d3.text(recipient).then(function (text) {
        modal.find('.model-bib').text(text)
    });
})

function copy_to_clipboard() {
    // Get the text field
    var modal = document.getElementById("exampleModal");
    var text = modal.getElementsByClassName("model-bib")[0].innerText;
    // Copy the text inside the text field
    navigator.clipboard.writeText(text);
}


function loadPapers(tag = "all") {
    d3.json("content/papers.json").then(function (json) {

        // Get the tags from buttons in btn-group-toggle; name="tags"

        // var tags_elements = document.getElementsByName("tags");
        // for (var i = 0; i < tags_elements.length; i++) {
        //     if (tags_elements[i].checked) {
        //         var tag = tags_elements[i].id;
        //     }
        // }


        // order the papers by year, if the same year by title
        var keys = Object.keys(json);
        keys.sort(function (a, b) {
            if (json[a]["year"] === json[b]["year"]) {
                if (json[a]["title"] < json[b]["title"]) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                return json[b]["year"] - json[a]["year"];
            }
        });

        var n_papers = 0;
        var to_push_str = "";
        for (k = 0; k < keys.length; k++) {
            var paper_folder = keys[k];
            var paper_title = json[paper_folder]["title"];
            var paper_venue = json[paper_folder]["venue"];
            var paper_year = json[paper_folder]["year"];
            var paper_authors = json[paper_folder]["authors"];
            var paper_tags = json[paper_folder]["tags"];


            if (tag === "all" || paper_tags.includes(tag)) {
                paper_authors = paper_authors.replace("Samuele Zoboli", "<b>Samuele Zoboli</b>");
                var buttons = create_buttons(json[paper_folder]);
                if (paper_tags.includes("submitted")) {
                    var submitted = true;
                }
                else {
                    var submitted = false;
                }
                buttons += create_cite_button(paper_folder, submitted);


                // fill the template
                var html = template.replace("{paper_folder}", paper_folder);
                html = html.replace("{paper_title}", paper_title);
                html = html.replace("{paper_venue}", paper_venue);
                html = html.replace("{paper_authors}", paper_authors);
                html = html.replace("{date}", paper_year);
                html = html.replace("{buttons}", buttons);


                to_push_str += "\n\n" + html;
                n_papers += 1;
            }
        }

        // Select div id="papers_items"
        var div = document.getElementById("papers_items");
        div.innerHTML = to_push_str;

        // Update the number of papers
        // if n_papers > 1 "papers" else n_papers + " paper"
        var unit = "element";
        if (n_papers > 1) {
            unit = "elements";
        }
        var n_papers_str = n_papers + " " + unit;
        var n_papers_div = document.getElementById("n_papers");
        n_papers_div.innerHTML = n_papers_str;

    });
}

function displayLastModified() {
    const lastModified = new Date(document.lastModified); // Get the last modified date
    const day = String(lastModified.getDate()).padStart(2, '0'); // Day with leading zero
    const month = String(lastModified.getMonth() + 1).padStart(2, '0'); // Month (0-based, so add 1)
    const year = lastModified.getFullYear(); // Full year
    const formattedDate = `${day}/${month}/${year}`; // Italian date format
    document.getElementById('last-updated').textContent = `Last updated: ${formattedDate}`;
}

// For student details
function toggleDetails(id) {
    const element = document.getElementById(id);
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

document.querySelectorAll('.dropdown-item').forEach(function (item) {
    item.addEventListener('click', function () {
        const selectedFilterId = item.getAttribute('id');
        const selectedTag = item.getAttribute('data-filter');
        const filterText = document.querySelector('#filterText');

        // Set the filter text by removing the last '-filter' from the id
        const filterNewTag = selectedFilterId.slice(0, -7)
        filterText.innerHTML = '<span>' + filterNewTag + '</span>';

        loadPapers(selectedTag);
    });
});



loadPapers();