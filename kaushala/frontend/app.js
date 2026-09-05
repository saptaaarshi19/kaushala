/* =========================================================
   KAUSHALA
   Main application JavaScript
========================================================= */

const $ = selector =>
    document.querySelector(selector);


/* =========================================================
   GLOBAL STATE
========================================================= */

let accountRole = 'student';

let recruiterVerified = false;

let applicationsTotal = 28;

const submittedApplications = new Set();


/* =========================================================
   PROJECT DATA
========================================================= */

const projects = [

    {
        name:'Cartly',
        category:'E-commerce',
        desc:'A fast, accessible local commerce experience.',
        visibility:'Public',
        repo:'https://github.com/'
    },

    {
        name:'StudyFlow',
        category:'Education',
        desc:'A collaborative study planner for campus teams.',
        visibility:'Recruiters only',
        repo:'https://github.com/'
    },

    {
        name:'Pulse',
        category:'Technology',
        desc:'Real-time dashboard for open-source teams.',
        visibility:'Public',
        repo:'https://github.com/'
    }

];


/* =========================================================
   OPPORTUNITY DATA
========================================================= */

const opportunities = [

    {
        initial:'N',
        company:'Nova Labs',
        title:'Frontend Engineering Intern',
        type:'internship',
        model:'project',
        location:'Remote',
        category:'Technology',
        match:'92%'
    },

    {
        initial:'C',
        company:'Canvas',
        title:'Product Builder Fellowship',
        type:'internship',
        model:'project',
        location:'Bengaluru',
        category:'Technology',
        match:'87%'
    },

    {
        initial:'S',
        company:'Supercell',
        title:'Full-stack Intern',
        type:'internship',
        model:'experience',
        location:'Hybrid',
        category:'Technology',
        match:'84%'
    },

    {
        initial:'E',
        company:'Edvora',
        title:'Learning Experience Intern',
        type:'internship',
        model:'project',
        location:'Remote',
        category:'Education',
        match:'81%'
    }

];


/* =========================================================
   PROJECT RENDER
========================================================= */

function renderProjects(){

    const html = projects
        .map(project => `

            <article class="project">

                <div class="project-art">

                    ${project.name}

                    <br>

                    <small>
                        ${project.category.toUpperCase()}
                    </small>

                </div>

                <div class="project-body">

                    <h3>
                        ${project.name}
                    </h3>

                    <p>
                        ${project.desc}
                    </p>

                    <div class="project-meta">

                        <span>
                            ${project.category}
                        </span>

                        <span>
                            ◉ ${project.visibility}
                        </span>

                    </div>

                </div>

            </article>

        `)
        .join('');

    const cards = $('#projectCards');

    const all = $('#allProjects');

    if(cards)
        cards.innerHTML = html;

    if(all)
        all.innerHTML = html;
}


/* =========================================================
   OPPORTUNITY RENDER
========================================================= */

function renderOpps(filter='all'){

    const list = $('#oppList');

    if(!list)
        return;

    let filtered = opportunities;

    if(filter !== 'all'){

        filtered = opportunities.filter(
            opportunity => {

                if(filter === 'internship')
                    return opportunity.type === 'internship';

                if(filter === 'project')
                    return opportunity.model === 'project';

                if(filter === 'experience')
                    return opportunity.model === 'experience';

                if(filter === 'remote')
                    return opportunity.location === 'Remote';

                return true;
            }
        );

    }

    list.innerHTML = filtered
        .map(
            (opportunity,index) => {

                const applied =
                    submittedApplications.has(
                        opportunity.title
                    );

                const colour =
                    ['coral','mint','lilac','blue'][index % 4];

                return `

                    <article class="opp-card">

                        <div class="company ${colour}">
                            ${opportunity.initial}
                        </div>

                        <div>

                            <h3>
                                ${opportunity.title}
                            </h3>

                            <p>
                                ${opportunity.company}
                                ·
                                ${opportunity.location}
                                ·
                                ${opportunity.category}
                            </p>

                        </div>

                        <span class="match">
                            ${opportunity.match} match
                        </span>

                        <button
                            class="primary apply"
                            ${applied ? 'disabled' : ''}
                            data-opportunity="${encodeURIComponent(opportunity.title)}"
                        >
                            ${
                                applied
                                    ? 'Applied ✓'
                                    : 'Apply →'
                            }
                        </button>

                    </article>

                `;
            }
        )
        .join('');

    list
        .querySelectorAll('.apply')
        .forEach(button => {

            button.onclick = () => {

                const title =
                    decodeURIComponent(
                        button.dataset.opportunity
                    );

                applyOpportunity(title);

            };

        });

}


/* =========================================================
   TOAST
========================================================= */

function toast(message){

    const element = $('#toast');

    if(!element)
        return;

    element.textContent = message;

    element.classList.remove('hidden');

    clearTimeout(
        window.__kaushalaToast
    );

    window.__kaushalaToast =
        setTimeout(
            () =>
                element.classList.add('hidden'),
            2800
        );

}


/* =========================================================
   APPLICATION
========================================================= */

function applyOpportunity(title){

    if(accountRole === 'recruiter'){

        toast(
            'Recruiter accounts cannot apply to opportunities.'
        );

        return;
    }

    if(
        submittedApplications.has(title)
    ){

        toast(
            'Your K.ID has already applied to this opportunity.'
        );

        return;
    }

    submittedApplications.add(title);

    applicationsTotal++;

    const profileName =
        $('#profileName')
            ?.childNodes[0]
            ?.textContent
            ?.trim() ||
        'Aryan Mehta';

    const kid =
        $('#kidValue')
            ?.textContent ||
        'KN-8240';

    const row =
        $('#applicantRows');

    if(row){

        const project =
            projects[0];

        const now =
            new Date().toLocaleString(
                'en-IN',
                {
                    day:'2-digit',
                    month:'short',
                    year:'numeric',
                    hour:'2-digit',
                    minute:'2-digit'
                }
            );

        row.insertAdjacentHTML(
            'afterbegin',
            `

                <tr>

                    <td>
                        <b>#NEW</b>
                    </td>

                    <td>
                        ${kid}
                    </td>

                    <td>
                        <strong>
                            ${profileName}
                        </strong>
                    </td>

                    <td>
                        ${title}
                    </td>

                    <td>
                        <a href="#">
                            ${project.name} ↗
                        </a>
                    </td>

                    <td>
                        ${now}
                    </td>

                    <td>
                        <span class="fit">
                            Pending
                        </span>
                    </td>

                </tr>

            `
        );

    }

    const count =
        $('#applicationCount');

    if(count)
        count.textContent =
            applicationsTotal;

    renderOpps(
        document.querySelector(
            '.filters .selected'
        )?.dataset.filter ||
        'all'
    );

    toast(
        'Application submitted. Your K.ID can apply once to this opportunity.'
    );
}


/* =========================================================
   RECRUITER ACCESS
========================================================= */

function updateRecruiterAccess(){

    const recruiter =
        accountRole === 'recruiter';

    const openJob =
        $('#openJob');

    const gate =
        $('#recruiterGate');

    if(openJob){

        openJob.classList.toggle(
            'hidden',
            !recruiter ||
            !recruiterVerified
        );

    }

    if(gate){

        gate.classList.toggle(
            'hidden',
            !recruiter ||
            recruiterVerified
        );

    }

    const subtitle =
        $('#opportunitySubtitle');

    if(!subtitle)
        return;

    if(
        recruiter &&
        recruiterVerified
    ){

        subtitle.textContent =
            'You are verified to publish trusted opportunities to matched candidates.';

    }else if(recruiter){

        subtitle.textContent =
            'Complete verification to publish opportunities to students.';

    }else{

        subtitle.textContent =
            'Matched to your verified skills, interests, and project categories.';

    }

}


/* =========================================================
   RECRUITER DASHBOARD
========================================================= */

function renderRecruiterPortal(){

    const root =
        $('#recruiterDashboard');

    if(!root)
        return;

    root.innerHTML = `

        <section class="recruiter-stats">

            <div>
                <small>OPPORTUNITIES POSTED</small>
                <strong>12</strong>
                <em>+2 This month</em>
            </div>

            <div>
                <small>TOTAL APPLICANTS</small>
                <strong>248</strong>
                <em>+34 This month</em>
            </div>

            <div>
                <small>SHORTLISTED</small>
                <strong>38</strong>
                <em>+6 This month</em>
            </div>

            <div>
                <small>AVERAGE FIT SCORE</small>
                <strong>86%</strong>
                <em>Across active roles</em>
            </div>

        </section>


        <section class="panel">

            <div class="panel-title">

                <div>

                    <p class="eyebrow">
                        OPPORTUNITY PERFORMANCE
                    </p>

                    <h2>
                        Roles in motion
                    </h2>

                </div>

                <button
                    class="link-btn"
                    data-tab="opportunities"
                >
                    Manage roles →
                </button>

            </div>


            <div class="role-health">

                <div>

                    <span class="company coral">
                        N
                    </span>

                    <div>

                        <b>
                            Frontend Engineering Intern
                        </b>

                        <p>
                            Project-based · Remote
                        </p>

                    </div>

                    <strong>
                        14
                        <small>applicants</small>
                    </strong>

                </div>


                <div>

                    <span class="company mint">
                        N
                    </span>

                    <div>

                        <b>
                            Full-stack Intern
                        </b>

                        <p>
                            Experience-based · Hybrid
                        </p>

                    </div>

                    <strong>
                        09
                        <small>applicants</small>
                    </strong>

                </div>


                <div>

                    <span class="company lilac">
                        N
                    </span>

                    <div>

                        <b>
                            Product Design Fellow
                        </b>

                        <p>
                            Project-based · Bengaluru
                        </p>

                    </div>

                    <strong>
                        05
                        <small>applicants</small>
                    </strong>

                </div>

            </div>

        </section>

    `;

    root
        .querySelectorAll('[data-tab]')
        .forEach(
            element =>
                element.onclick =
                    () =>
                        switchTab(
                            element.dataset.tab
                        )
        );

}


/* =========================================================
   APPLICATION START
========================================================= */

function showApp(
    name='Aryan Mehta',
    role='student'
){

    $('#auth')
        ?.classList
        .add('hidden');

    $('#app')
        ?.classList
        .remove('hidden');

    accountRole = role;

    const initials =
        name
            .split(/\s+/)
            .filter(Boolean)
            .map(word => word[0])
            .join('')
            .slice(0,2)
            .toUpperCase();

    const profileName =
        $('#profileName');

    if(profileName){

        profileName.childNodes[0]
            .textContent =
            `${name} `;

    }

    if($('#sideName'))
        $('#sideName').textContent =
            name;

    if($('#greetingName')){

        $('#greetingName')
            .textContent =
            role === 'recruiter'
                ? 'HIRING TEAM'
                : name
                    .split(/\s+/)[0]
                    .toUpperCase();

    }

    if($('#bigAvatar'))
        $('#bigAvatar').textContent =
            initials;

    const miniAvatar =
        document.querySelector(
            '.profile-mini .avatar'
        );

    if(miniAvatar)
        miniAvatar.textContent =
            initials;

    const miniRole =
        document.querySelector(
            '.profile-mini small'
        );

    if(miniRole)
        miniRole.textContent =
            role === 'recruiter'
                ? 'Recruiter'
                : 'Student';

    if(role === 'recruiter')
        renderRecruiterPortal();

    updateRecruiterAccess();

    renderProjects();

    renderOpps();

    requestAnimationFrame(
        () => {

            renderGithubActivity();

            renderRadarChart();

        }
    );

}


/* =========================================================
   AUTH EVENTS
========================================================= */

$('#createID')?.addEventListener(
    'click',
    () => {

        const name =
            $('#name')
                .value
                .trim();

        const email =
            $('#email')
                .value
                .trim();

        const role =
            $('#role')
                .value
                .includes('Recruiter')
                ? 'recruiter'
                : 'student';

        if(
            !name ||
            !email ||
            !email.includes('@')
        ){

            toast(
                'Add your name and a valid email to continue.'
            );

            return;
        }

        const id =
            'KN-' +
            Math.floor(
                1000 +
                Math.random() *
                9000
            );

        $('#kidValue')
            .textContent =
            id;

        showApp(
            name,
            role
        );

        toast(
            `Your K.ID ${id} is ready.`
        );

    }
);


$('#demoLogin')?.addEventListener(
    'click',
    event => {

        event.preventDefault();

        showApp();

    }
);


/* =========================================================
   TAB SWITCHING
========================================================= */

function switchTab(id){

    document
        .querySelectorAll('.tab-panel')
        .forEach(
            panel =>
                panel.classList.add('hidden')
        );

    const target =
        $('#'+id);

    if(target)
        target.classList.remove('hidden');

    document
        .querySelectorAll('nav a')
        .forEach(
            link =>
                link.classList.toggle(
                    'active',
                    link.dataset.tab === id
                )
        );

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });

    requestAnimationFrame(
        () => {

            renderGithubActivity();

            renderRadarChart();

        }
    );

}


document
    .querySelectorAll('[data-tab]')
    .forEach(
        element => {

            element.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    switchTab(
                        element.dataset.tab
                    );

                }
            );

        }
    );


/* =========================================================
   PROJECT MODAL
========================================================= */

function openProjectModal(){

    $('#modal')
        ?.classList
        .remove('hidden');

}

$('#openProject')
    ?.addEventListener(
        'click',
        openProjectModal
    );

$('#openProject2')
    ?.addEventListener(
        'click',
        openProjectModal
    );

$('#closeModal')
    ?.addEventListener(
        'click',
        () =>
            $('#modal')
                .classList
                .add('hidden')
    );


/* =========================================================
   SAVE PROJECT
========================================================= */

$('#saveProject')
    ?.addEventListener(
        'click',
        () => {

            const name =
                $('#projectName')
                    .value
                    .trim();

            if(!name){

                toast(
                    'Give your project a name first.'
                );

                return;
            }

            projects.unshift({

                name,

                category:
                    $('#projectCategory')
                        .value,

                visibility:
                    $('#projectVisibility')
                        .value,

                repo:
                    $('#projectRepo')
                        .value
                        .trim(),

                desc:
                    'A new project added to this proof-led portfolio.'

            });

            renderProjects();

            $('#modal')
                .classList
                .add('hidden');

            $('#projectName')
                .value = '';

            $('#projectRepo')
                .value = '';

            toast(
                'Project added to your portfolio.'
            );

        }
    );


/* =========================================================
   JOB MODAL
========================================================= */

$('#openJob')
    ?.addEventListener(
        'click',
        () =>
            $('#jobModal')
                .classList
                .remove('hidden')
    );

$('#closeJobModal')
    ?.addEventListener(
        'click',
        () =>
            $('#jobModal')
                .classList
                .add('hidden')
    );


/* =========================================================
   SAVE JOB
========================================================= */

$('#saveJob')
    ?.addEventListener(
        'click',
        () => {

            const title =
                $('#jobTitle')
                    .value
                    .trim();

            const company =
                $('#jobCompany')
                    .value
                    .trim();

            if(
                !title ||
                !company
            ){

                toast(
                    'Add a role title and organization.'
                );

                return;
            }

            opportunities.unshift({

                initial:
                    company[0]
                        .toUpperCase(),

                company,

                title,

                type:
                    'internship',

                model:
                    $('#jobType')
                        .value === 'Project-based'
                        ? 'project'
                        : 'experience',

                location:
                    $('#jobLocation')
                        .value,

                category:
                    $('#jobCategory')
                        .value,

                match:
                    'New'

            });

            renderOpps();

            $('#jobModal')
                .classList
                .add('hidden');

            $('#jobTitle').value='';
            $('#jobCompany').value='';

            toast(
                'Opportunity published for matched candidates.'
            );

        }
    );


/* =========================================================
   RECRUITER VERIFICATION
========================================================= */

$('#openVerify')
    ?.addEventListener(
        'click',
        () =>
            $('#verifyModal')
                .classList
                .remove('hidden')
    );

$('#closeVerifyModal')
    ?.addEventListener(
        'click',
        () =>
            $('#verifyModal')
                .classList
                .add('hidden')
    );

$('#verifyRecruiter')
    ?.addEventListener(
        'click',
        () => {

            const company =
                $('#verifyCompany')
                    .value
                    .trim();

            const hires =
                Number(
                    $('#hireCount')
                        .value
                );

            const attested =
                $('#attest')
                    .checked;

            if(
                !company ||
                hires < 100 ||
                !attested
            ){

                toast(
                    'Confirm a recognized company, 100+ hires, and the attestation.'
                );

                return;
            }

            recruiterVerified = true;

            $('#verifyModal')
                .classList
                .add('hidden');

            updateRecruiterAccess();

            toast(
                'Verified recruiter badge granted.'
            );

        }
    );


/* =========================================================
   OPPORTUNITY FILTERS
========================================================= */

document
    .querySelectorAll(
        '.filters button'
    )
    .forEach(
        button => {

            button.addEventListener(
                'click',
                () => {

                    document
                        .querySelectorAll(
                            '.filters button'
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    'selected'
                                )
                        );

                    button.classList.add(
                        'selected'
                    );

                    renderOpps(
                        button.dataset.filter ||
                        'all'
                    );

                }
            );

        }
    );


/* =========================================================
   GITHUB CONTRIBUTION SYSTEM
========================================================= */

const githubMonths = [

    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'

];

const githubShortMonths = [

    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'

];


const githubState = {

    view:'year',

    year:2026,

    month:8

};


/* ---------------------------------------------------------
   SEEDED VALUE
--------------------------------------------------------- */

function githubSeed(
    year,
    month,
    day
){

    const value =
        Math.sin(
            year * 12.9898 +
            month * 78.233 +
            day * 37.719
        ) *
        43758.5453;

    return value -
        Math.floor(value);

}


/* ---------------------------------------------------------
   CONTRIBUTION COUNT
--------------------------------------------------------- */

function githubContributionCount(
    year,
    month,
    day
){

    const date =
        new Date(
            year,
            month,
            day
        );

    if(
        date >
        new Date()
    )
        return 0;

    const weekday =
        date.getDay();

    const seedA =
        githubSeed(
            year,
            month + 1,
            day
        );

    const seedB =
        githubSeed(
            year + 19,
            month + 7,
            day + 13
        );

    /*
     * Weekdays naturally receive
     * more activity than weekends.
     */

    const probability =
        weekday === 0 ||
        weekday === 6
            ? 0.30
            : 0.45;

    if(seedA > probability)
        return 0;

    if(seedB < 0.48)
        return 1;

    if(seedB < 0.74)
        return 2;

    if(seedB < 0.90)
        return 3;

    if(seedB < 0.975)
        return 5;

    return 8;

}


/* ---------------------------------------------------------
   CONTRIBUTION LEVEL
--------------------------------------------------------- */

function githubLevel(count){

    if(count <= 0)
        return 0;

    if(count <= 1)
        return 1;

    if(count <= 2)
        return 2;

    if(count <= 4)
        return 3;

    return 4;

}


/* ---------------------------------------------------------
   FORMAT DATE
--------------------------------------------------------- */

function githubFormatDate(date){

    return date.toLocaleDateString(
        'en-IN',
        {
            day:'numeric',
            month:'short',
            year:'numeric'
        }
    );

}


/* ---------------------------------------------------------
   YEAR DATA
--------------------------------------------------------- */

function getGithubYearData(year){

    const result = [];

    const start =
        new Date(
            year,
            0,
            1
        );

    const end =
        new Date(
            year,
            11,
            31
        );

    for(
        let date =
            new Date(start);

        date <= end;

        date.setDate(
            date.getDate()+1
        )
    ){

        const current =
            new Date(date);

        result.push({

            date:current,

            count:
                githubContributionCount(
                    year,
                    current.getMonth(),
                    current.getDate()
                )

        });

    }

    return result;

}


/* ---------------------------------------------------------
   MONTH DATA
--------------------------------------------------------- */

function getGithubMonthData(
    year,
    month
){

    const result = [];

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    for(
        let day=1;

        day<=lastDay;

        day++
    ){

        const date =
            new Date(
                year,
                month,
                day
            );

        result.push({

            date,

            count:
                githubContributionCount(
                    year,
                    month,
                    day
                )

        });

    }

    return result;

}


/* ---------------------------------------------------------
   STATS
--------------------------------------------------------- */

function getGithubStats(days){

    let total=0;

    let running=0;

    let current=0;

    let best=0;

    days.forEach(
        item => {

            total += item.count;

            if(item.count > 0){

                running++;

                best =
                    Math.max(
                        best,
                        running
                    );

            }else{

                running=0;

            }

        }
    );


    for(
        let index =
            days.length-1;

        index >= 0 &&
        days[index].count > 0;

        index--
    ){

        current++;

    }


    return {

        total,

        current,

        best

    };

}


/* ---------------------------------------------------------
   CREATE CONTRIBUTION CELL
--------------------------------------------------------- */

function createGithubCell(item){

    if(!item){

        const empty =
            document.createElement(
                'span'
            );

        empty.className =
            'github-day empty';

        return empty;

    }


    const cell =
        document.createElement(
            'button'
        );

    cell.type =
        'button';

    cell.className =
        `github-day level-${githubLevel(item.count)}`;

    cell.dataset.count =
        item.count;

    cell.dataset.date =
        item.date.toISOString();

    cell.setAttribute(
        'aria-label',
        `${item.count} contribution${
            item.count === 1
                ? ''
                : 's'
        } on ${githubFormatDate(item.date)}`
    );

    cell.title =
        `${item.count} contribution${
            item.count === 1
                ? ''
                : 's'
        } on ${githubFormatDate(item.date)}`;


    cell.addEventListener(
        'mouseenter',
        () =>
            showGithubTooltip(cell)
    );

    cell.addEventListener(
        'focus',
        () =>
            showGithubTooltip(cell)
    );

    cell.addEventListener(
        'mouseleave',
        hideGithubTooltip
    );

    cell.addEventListener(
        'blur',
        hideGithubTooltip
    );


    return cell;

}


/* ---------------------------------------------------------
   TOOLTIP
--------------------------------------------------------- */

function showGithubTooltip(cell){

    const tooltip =
        $('#githubTooltip');

    const container =
        $('.github-profile');

    if(
        !tooltip ||
        !container
    )
        return;

    const cellRect =
        cell.getBoundingClientRect();

    const containerRect =
        container.getBoundingClientRect();

    const date =
        new Date(
            cell.dataset.date
        );

    const count =
        Number(
            cell.dataset.count
        );

    tooltip.innerHTML = `

        <strong>
            ${count}
            contribution${count === 1 ? '' : 's'}
        </strong>

        <span>
            ${githubFormatDate(date)}
        </span>

    `;

    tooltip.style.left =
        `${
            cellRect.left -
            containerRect.left +
            cellRect.width / 2
        }px`;

    tooltip.style.top =
        `${
            cellRect.top -
            containerRect.top
        }px`;

    tooltip.classList.add(
        'visible'
    );

}


function hideGithubTooltip(){

    $('#githubTooltip')
        ?.classList
        .remove('visible');

}


/* ---------------------------------------------------------
   MONTH LABELS
--------------------------------------------------------- */

function renderGithubMonthLabels(
    year,
    firstDayOffset,
    weeks
){

    const labels =
        $('#githubMonthLabels');

    if(!labels)
        return;

    labels.innerHTML='';

    labels.style.setProperty(
        '--github-weeks',
        weeks
    );


    let lastColumn =
        -2;


    for(
        let month=0;

        month<12;

        month++
    ){

        const date =
            new Date(
                year,
                month,
                1
            );

        const dayOfYear =
            Math.floor(
                (
                    date -
                    new Date(
                        year,
                        0,
                        1
                    )
                ) /
                86400000
            );

        const column =
            Math.floor(
                (
                    dayOfYear +
                    firstDayOffset
                ) /
                7
            );


        if(
            column <=
            lastColumn + 1
        )
            continue;


        const label =
            document.createElement(
                'span'
            );

        label.textContent =
            githubShortMonths[month];

        label.style.gridColumn =
            `${column + 1}`;

        labels.appendChild(
            label
        );

        lastColumn =
            column;

    }

}


/* ---------------------------------------------------------
   YEAR VIEW
--------------------------------------------------------- */

function renderGithubYear(){

    const heatmap =
        $('#githubHeatmap');

    if(!heatmap)
        return;


    const year =
        Number(
            $('#githubYear')?.value ||
            githubState.year
        );

    githubState.year =
        year;


    const days =
        getGithubYearData(
            year
        );


    const firstDate =
        new Date(
            year,
            0,
            1
        );

    const firstDayOffset =
        firstDate.getDay();


    const weeks =
        Math.ceil(
            (
                firstDayOffset +
                days.length
            ) /
            7
        );


    heatmap.className =
        'heatmap github-year-view';

    heatmap.style.setProperty(
        '--github-weeks',
        weeks
    );


    renderGithubMonthLabels(
        year,
        firstDayOffset,
        weeks
    );


    heatmap.innerHTML='';


    /*
     * CSS grid is row-first visually.
     * We deliberately insert week-by-week
     * so each column represents one week.
     */

    for(
        let week=0;

        week<weeks;

        week++
    ){

        for(
            let weekday=0;

            weekday<7;

            weekday++
        ){

            const index =
                week * 7 +
                weekday -
                firstDayOffset;

            heatmap.appendChild(
                createGithubCell(
                    days[index] ||
                    null
                )
            );

        }

    }


    updateGithubSummary(
        days,
        year
    );

}


/* ---------------------------------------------------------
   MONTH VIEW
--------------------------------------------------------- */

function renderGithubMonth(){

    const heatmap =
        $('#githubHeatmap');

    const labels =
        $('#githubMonthLabels');

    if(!heatmap)
        return;


    const year =
        Number(
            $('#githubYear')?.value ||
            githubState.year
        );

    const month =
        Number(
            $('#githubMonth')?.value ??
            githubState.month
        );


    githubState.year =
        year;

    githubState.month =
        month;


    const days =
        getGithubMonthData(
            year,
            month
        );


    const firstDate =
        days[0].date;

    const firstDayOffset =
        firstDate.getDay();


    const weeks =
        Math.ceil(
            (
                firstDayOffset +
                days.length
            ) /
            7
        );


    heatmap.className =
        'heatmap github-month-view';

    heatmap.style.setProperty(
        '--github-weeks',
        weeks
    );


    if(labels){

        labels.innerHTML='';

        const title =
            document.createElement(
                'span'
            );

        title.textContent =
            `${githubMonths[month]} ${year}`;

        title.style.gridColumn =
            '1 / -1';

        labels.appendChild(
            title
        );

    }


    heatmap.innerHTML='';


    for(
        let week=0;

        week<weeks;

        week++
    ){

        for(
            let weekday=0;

            weekday<7;

            weekday++
        ){

            const index =
                week * 7 +
                weekday -
                firstDayOffset;

            heatmap.appendChild(
                createGithubCell(
                    days[index] ||
                    null
                )
            );

        }

    }


    updateGithubSummary(
        days,
        year,
        month
    );

}


/* ---------------------------------------------------------
   SUMMARY
--------------------------------------------------------- */

function updateGithubSummary(
    days,
    year,
    month=null
){

    const stats =
        getGithubStats(
            days
        );


    const summary =
        $('#githubSummary');

    if(summary){

        summary.textContent =
            month === null
                ? `${stats.total} contributions in ${year}`
                : `${stats.total} contributions in ${githubMonths[month]} ${year}`;

    }


    const numbers =
        $('#githubNumbers');

    if(numbers){

        numbers.innerHTML = `

            <span>

                <b>
                    12
                </b>

                repositories

            </span>

            <span>

                <b>
                    ${stats.total}
                </b>

                contributions

            </span>

            <span>

                <b>
                    ${stats.current}
                </b>

                day streak

            </span>

        `;

    }

}


/* ---------------------------------------------------------
   MAIN GITHUB RENDER
--------------------------------------------------------- */

function renderGithubActivity(){

    const heatmap =
        $('#githubHeatmap');

    if(!heatmap)
        return;


    const yearSelect =
        $('#githubYear');

    const monthSelect =
        $('#githubMonth');


    if(
        yearSelect &&
        yearSelect.value
    ){

        githubState.year =
            Number(
                yearSelect.value
            );

    }


    if(
        monthSelect &&
        monthSelect.value !== ''
    ){

        githubState.month =
            Number(
                monthSelect.value
            );

    }


    const yearMode =
        githubState.view === 'year';


    if(yearSelect){

        yearSelect.classList.remove(
            'hidden'
        );

    }


    if(monthSelect){

        monthSelect.classList.toggle(
            'hidden',
            yearMode
        );

    }


    document
        .querySelectorAll(
            '.github-view'
        )
        .forEach(
            button =>
                button.classList.toggle(
                    'active',
                    button.dataset.githubView ===
                    githubState.view
                )
        );


    if(yearMode){

        renderGithubYear();

    }else{

        renderGithubMonth();

    }

}


/* ---------------------------------------------------------
   GITHUB CONTROLS
--------------------------------------------------------- */

document
    .querySelectorAll(
        '.github-view'
    )
    .forEach(
        button => {

            button.addEventListener(
                'click',
                () => {

                    githubState.view =
                        button.dataset.githubView === 'month'
                            ? 'month'
                            : 'year';

                    renderGithubActivity();

                }
            );

        }
    );


$('#githubYear')
    ?.addEventListener(
        'change',
        () =>
            renderGithubActivity()
    );


$('#githubMonth')
    ?.addEventListener(
        'change',
        () =>
            renderGithubActivity()
    );


/* =========================================================
   LEETCODE RADAR
========================================================= */

const radarSkills = [

    {
        name:'Arrays',
        score:84
    },

    {
        name:'Strings',
        score:72
    },

    {
        name:'Hashing',
        score:68
    },

    {
        name:'Trees',
        score:76
    },

    {
        name:'Dynamic programming',
        score:63
    },

    {
        name:'Graphs',
        score:79
    }

];


/* ---------------------------------------------------------
   RADAR POINT
--------------------------------------------------------- */

function radarPoint(
    index,
    score
){

    const cx = 180;

    const cy = 105;

    const radius = 80;

    const angle =
        (
            -90 +
            index * 60
        ) *
        Math.PI /
        180;

    const safeScore =
        Math.max(
            0,
            Math.min(
                100,
                Number(score) || 0
            )
        );

    const distance =
        radius *
        safeScore /
        100;


    return {

        x:
            cx +
            Math.cos(angle) *
            distance,

        y:
            cy +
            Math.sin(angle) *
            distance

    };

}


/* ---------------------------------------------------------
   RADAR INTERACTION
--------------------------------------------------------- */

function showRadarSkill(index){

    const skill =
        radarSkills[index];

    if(!skill)
        return;


    document
        .querySelectorAll(
            '.radar-nodes circle'
        )
        .forEach(
            (node,nodeIndex) =>
                node.classList.toggle(
                    'active',
                    nodeIndex === index
                )
        );


    document
        .querySelectorAll(
            '.radar-list button'
        )
        .forEach(
            (button,buttonIndex) =>
                button.classList.toggle(
                    'active',
                    buttonIndex === index
                )
        );


    const insight =
        $('#radarInsight');

    if(insight){

        insight.textContent =
            `${skill.name} · ${skill.score} / 100`;

    }


    const nodes =
        document.querySelectorAll(
            '.radar-nodes circle'
        );

    const node =
        nodes[index];

    const wrap =
        $('.radar-wrap');

    if(
        !node ||
        !wrap
    )
        return;


    let tooltip =
        $('#radarTooltip');


    if(!tooltip){

        tooltip =
            document.createElement(
                'div'
            );

        tooltip.id =
            'radarTooltip';

        tooltip.className =
            'radar-tooltip';

        wrap.appendChild(
            tooltip
        );

    }


    const nodeRect =
        node.getBoundingClientRect();

    const wrapRect =
        wrap.getBoundingClientRect();


    tooltip.innerHTML = `

        <b>
            ${skill.name}
        </b>

        <span>
            ${skill.score} / 100
        </span>

    `;


    tooltip.style.left =
        `${
            nodeRect.left -
            wrapRect.left +
            nodeRect.width / 2
        }px`;


    tooltip.style.top =
        `${
            nodeRect.top -
            wrapRect.top -
            8
        }px`;


    tooltip.classList.add(
        'visible'
    );

}


/* ---------------------------------------------------------
   RADAR RENDER
--------------------------------------------------------- */

function renderRadarChart(){

    const polygon =
        $('.radar-data');

    const nodes =
        document.querySelectorAll(
            '.radar-nodes circle'
        );


    if(
        !polygon ||
        nodes.length !==
        radarSkills.length
    )
        return;


    polygon.setAttribute(
        'points',

        radarSkills
            .map(
                (skill,index) => {

                    const point =
                        radarPoint(
                            index,
                            skill.score
                        );

                    return `
                        ${point.x.toFixed(1)},
                        ${point.y.toFixed(1)}
                    `
                        .replace(
                            /\s+/g,
                            ''
                        );

                }
            )
            .join(' ')
    );


    nodes.forEach(
        (node,index) => {

            const skill =
                radarSkills[index];

            const point =
                radarPoint(
                    index,
                    skill.score
                );


            node.setAttribute(
                'cx',
                point.x.toFixed(1)
            );

            node.setAttribute(
                'cy',
                point.y.toFixed(1)
            );

            node.dataset.skill =
                skill.name;

            node.dataset.score =
                skill.score;


            node.setAttribute(
                'tabindex',
                '0'
            );

            node.setAttribute(
                'role',
                'button'
            );

            node.setAttribute(
                'aria-label',
                `${skill.name}: ${skill.score} out of 100`
            );


            node.onclick =
                () =>
                    showRadarSkill(
                        index
                    );

            node.onmouseenter =
                () =>
                    showRadarSkill(
                        index
                    );

            node.onfocus =
                () =>
                    showRadarSkill(
                        index
                    );

            node.onkeydown =
                event => {

                    if(
                        event.key === 'Enter' ||
                        event.key === ' '
                    ){

                        event.preventDefault();

                        showRadarSkill(
                            index
                        );

                    }

                };

        }
    );


    document
        .querySelectorAll(
            '.radar-list button'
        )
        .forEach(
            (button,index) => {

                button.onclick =
                    () =>
                        showRadarSkill(
                            index
                        );

                button.onmouseenter =
                    () =>
                        showRadarSkill(
                            index
                        );

            }
        );


    showRadarSkill(0);

}


/* =========================================================
   CV BUILDER
========================================================= */

function cvHTML(){

    const name =
        $('#profileName')
            ?.childNodes[0]
            ?.textContent
            ?.trim() ||
        'Aryan Mehta';


    const projectList =
        projects
            .slice(0,4)
            .map(
                project =>
                    `
                    <li>
                        <b>
                            ${project.name}
                        </b>
                        —
                        ${project.desc}
                        <em>
                            (${project.category})
                        </em>
                    </li>
                    `
            )
            .join('');


    return `

        <!doctype html>

        <html>

        <head>

            <meta charset="utf-8">

            <title>
                ${name} — CV
            </title>

            <style>

                body{
                    font-family:Arial,sans-serif;
                    color:#1b2432;
                    max-width:760px;
                    margin:42px auto;
                    line-height:1.5;
                    padding:0 25px;
                }

                h1{
                    font-size:30px;
                    margin:0;
                }

                h2{
                    font-size:14px;
                    text-transform:uppercase;
                    letter-spacing:1.2px;
                    color:#6041c9;
                    border-bottom:1px solid #d9ddef;
                    padding-bottom:5px;
                    margin-top:24px;
                }

                .meta{
                    color:#667085;
                    font-size:13px;
                }

                .tag{
                    display:inline-block;
                    background:#efebff;
                    color:#543bb2;
                    padding:3px 7px;
                    border-radius:10px;
                    font-size:11px;
                    margin:3px;
                }

                .stats{
                    display:flex;
                    gap:25px;
                    background:#f5f6fb;
                    padding:12px;
                    border-radius:7px;
                    font-size:12px;
                }

                .stats b{
                    display:block;
                    font-size:17px;
                }

            </style>

        </head>

        <body>

            <h1>
                ${name}
            </h1>

            <p class="meta">
                Computer Science Student · Bengaluru, India
                · K.ID ${$('#kidValue')?.textContent || 'KN-8240'}
            </p>

            <h2>
                Profile
            </h2>

            <p>
                Proof-led developer with strengths in
                full-stack development, product thinking,
                and problem solving.
            </p>

            <h2>
                Technical skills
            </h2>

            <span class="tag">
                JavaScript · Advanced
            </span>

            <span class="tag">
                React · Advanced
            </span>

            <span class="tag">
                Data Structures · Verified
            </span>

            <span class="tag">
                Full-stack development
            </span>

            <h2>
                Projects
            </h2>

            <ul>
                ${projectList}
            </ul>

            <h2>
                Credentials
            </h2>

            <ul>

                <li>
                    <b>
                        Meta Front-End Developer
                    </b>
                    —
                    Coursera,
                    May 2026
                </li>

                <li>
                    <b>
                        AWS Cloud Practitioner
                    </b>
                    —
                    Amazon Web Services,
                    February 2026
                </li>

            </ul>

            <h2>
                LeetCode performance
            </h2>

            <div class="stats">

                <span>
                    <b>247</b>
                    Problems solved
                </span>

                <span>
                    <b>1,682</b>
                    Contest rating
                </span>

                <span>
                    <b>Top 18%</b>
                    Global ranking
                </span>

            </div>

            <h2>
                GitHub activity
            </h2>

            <p>
                12 repositories ·
                206 contributions in 2026
            </p>

        </body>

        </html>

    `;

}


/* =========================================================
   CV EVENTS
========================================================= */

$('#buildCV')
    ?.addEventListener(
        'click',
        () => {

            const preview =
                $('#cvPreview');

            if(preview){

                const documentObject =
                    new DOMParser()
                        .parseFromString(
                            cvHTML(),
                            'text/html'
                        );

                preview.innerHTML =
                    documentObject
                        .body
                        .innerHTML;

            }

            $('#cvModal')
                .classList
                .remove('hidden');

        }
    );


$('#closeCVModal')
    ?.addEventListener(
        'click',
        () =>
            $('#cvModal')
                .classList
                .add('hidden')
    );


$('#downloadCV')
    ?.addEventListener(
        'click',
        () => {

            const name =
                (
                    $('#profileName')
                        ?.childNodes[0]
                        ?.textContent ||
                    'Aryan Mehta'
                )
                    .trim()
                    .replace(
                        /[^a-z0-9]/gi,
                        '_'
                    );


            const file =
                new Blob(
                    [cvHTML()],
                    {
                        type:
                            'application/msword'
                    }
                );


            const url =
                URL.createObjectURL(
                    file
                );


            const link =
                document.createElement(
                    'a'
                );

            link.href =
                url;

            link.download =
                `${name}_Kaushala_CV.doc`;

            link.click();

            URL.revokeObjectURL(
                url
            );


            toast(
                'Your CV document is downloading.'
            );

        }
    );


$('#printCV')
    ?.addEventListener(
        'click',
        () => {

            const win =
                window.open(
                    '',
                    '_blank'
                );

            if(!win){

                toast(
                    'Allow pop-ups to print your CV.'
                );

                return;
            }

            win.document.write(
                cvHTML()
            );

            win.document.close();

            win.focus();

            setTimeout(
                () =>
                    win.print(),
                250
            );

        }
    );


/* =========================================================
   COPY K.ID
========================================================= */

$('#copyKid')
    ?.addEventListener(
        'click',
        async () => {

            const value =
                $('#kidValue')
                    ?.textContent
                    ?.trim();

            if(!value)
                return;

            try{

                await navigator.clipboard.writeText(
                    value
                );

                toast(
                    'K.ID copied.'
                );

            }catch{

                toast(
                    `Your K.ID is ${value}`
                );

            }

        }
    );


/* =========================================================
   SIGN OUT
========================================================= */

$('#signout')
    ?.addEventListener(
        'click',
        () => {

            $('#app')
                .classList
                .add('hidden');

            $('#auth')
                .classList
                .remove('hidden');

        }
    );


/* =========================================================
   INITIALIZATION
========================================================= */

renderProjects();

renderOpps();

updateRecruiterAccess();

requestAnimationFrame(
    () => {

        renderGithubActivity();

        renderRadarChart();

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    'resize',
    () => {

        renderRadarChart();

    }
);