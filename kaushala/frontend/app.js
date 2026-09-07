const $=s=>document.querySelector(s);

let accountRole='student',recruiterVerified=false,applicationsTotal=28;

const submittedApplications=new Set();

const projects=[
  {
    name:'Cartly',
    category:'E-commerce',
    desc:'A fast, accessible local commerce experience.',
    visibility:'Public'
  },
  {
    name:'StudyFlow',
    category:'Education',
    desc:'A collaborative study planner for campus teams.',
    visibility:'Recruiters only'
  },
  {
    name:'Pulse',
    category:'Technology',
    desc:'Real-time dashboard for open-source teams.',
    visibility:'Public'
  }
];

const opportunities=[
  ['N','Nova Labs','Frontend Engineering Intern','Remote · 12 weeks','92%'],
  ['C','Canvas','Product Builder Fellowship','Bengaluru · Project-based','87%'],
  ['S','Supercell','Full-stack Intern','Hybrid · Experience-based','84%'],
  ['E','Edvora','Learning Experience Intern','Remote · Education','81%']
];

function renderProjects(){

  let h=projects.map(p=>`
    <article class="project">

      <div class="project-art">
        ${p.name}
        <br>
        <small>${p.category.toUpperCase()}</small>
      </div>

      <div class="project-body">

        <h3>${p.name}</h3>

        <p>${p.desc}</p>

        <div class="project-meta">
          <span>${p.category}</span>
          <span>◉ ${p.visibility}</span>
        </div>

      </div>

    </article>
  `).join('');

  $('#projectCards').innerHTML=h;
  $('#allProjects').innerHTML=h;
}


function renderOpps(){

  $('#oppList').innerHTML=opportunities.map((o,i)=>{

    let applied=submittedApplications.has(o[2]);

    return `
      <article class="opp-card">

        <div class="company ${['coral','mint','lilac','blue'][i]}">
          ${o[0]}
        </div>

        <div>
          <h3>${o[2]}</h3>
          <p>${o[1]} · ${o[3]}</p>
        </div>

        <span class="match">
          ${o[4]} match
        </span>

        <button
          class="primary apply"
          ${applied?'disabled':''}
          onclick="applyOpportunity('${o[2]}')"
        >
          ${applied?'Applied ✓':'Apply →'}
        </button>

      </article>
    `;

  }).join('');
}


function toast(m){

  let e=$('#toast');

  e.textContent=m;

  e.classList.remove('hidden');

  setTimeout(
    ()=>e.classList.add('hidden'),
    2800
  );
}


function applyOpportunity(title){

  if(accountRole==='recruiter')
    return toast(
      'Recruiter accounts cannot apply to opportunities.'
    );

  if(submittedApplications.has(title))
    return toast(
      'Your K.ID has already applied to this opportunity.'
    );

  submittedApplications.add(title);

  applicationsTotal++;

  let name=$('#profileName').childNodes[0].textContent.trim();

  let kid=$('#kidValue').textContent;

  let project=projects[0];

  let row=$('#applicantRows');

  if(row){

    let now=new Date().toLocaleString(
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
        <td><b>#NEW</b></td>
        <td>${kid}</td>
        <td><strong>${name}</strong></td>
        <td>${title}</td>
        <td>
          <a href="#">
            ${project.name} ↗
          </a>
        </td>
        <td>${now}</td>
        <td>
          <span class="fit">Pending</span>
        </td>
      </tr>
      `
    );
  }

  let count=$('#applicationCount');

  if(count)
    count.textContent=applicationsTotal;

  renderOpps();

  toast(
    'Application submitted. Your K.ID can apply once to this opportunity.'
  );
}


function renderRecruiterPortal(){

  let root=$('#recruiterDashboard');

  root.innerHTML=`

    <section class="portal-metrics">

      <div>
        <span>◌</span>
        <small>OPPORTUNITIES POSTED</small>
        <strong>12</strong>
        <em>+2 This month</em>
      </div>

      <div>
        <span>♙</span>
        <small>TOTAL APPLICANTS</small>
        <strong>248</strong>
        <em>+34 This month</em>
      </div>

      <div>
        <span>♧</span>
        <small>SHORTLISTED</small>
        <strong>38</strong>
        <em>+6 This month</em>
      </div>

      <div>
        <span>▣</span>
        <small>INTERVIEWS SCHEDULED</small>
        <strong>15</strong>
        <em>+3 This month</em>
      </div>

      <div>
        <span>◉</span>
        <small>PROFILE VIEWS</small>
        <strong>1,247</strong>
        <em>+19% This week</em>
      </div>

      <div>
        <span>◈</span>
        <small>REPO VIEWS (TOTAL)</small>
        <strong>892</strong>
        <em>+27% This week</em>
      </div>

    </section>


    <div class="portal-layout">

      <main>

        <section class="portal-panel posted-panel">

          <div class="portal-title">

            <h2>Your Posted Opportunities</h2>

            <a>
              View All Opportunities →
            </a>

          </div>


          <div class="portal-table-wrap">

            <table class="portal-table">

              <thead>

                <tr>
                  <th>Job title</th>
                  <th>Applications</th>
                  <th>Shortlisted</th>
                  <th>Status</th>
                  <th>Posted on</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>
                    <span class="candidate-photo p1">
                      AM
                    </span>

                    <b>
                      AI/ML Intern
                      <small>
                        Internship · Remote
                      </small>
                    </b>
                  </td>

                  <td>48</td>
                  <td>12</td>

                  <td>
                    <i class="status active">
                      ● Active
                    </i>
                  </td>

                  <td>02 Sep 2026</td>

                  <td>
                    <button class="row-btn">
                      View details
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>
                    <span class="candidate-photo p2">
                      BD
                    </span>

                    <b>
                      Backend Developer
                      <small>
                        Full-time · Bengaluru
                      </small>
                    </b>
                  </td>

                  <td>76</td>
                  <td>10</td>

                  <td>
                    <i class="status active">
                      ● Active
                    </i>
                  </td>

                  <td>28 Aug 2026</td>

                  <td>
                    <button class="row-btn">
                      View details
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>
                    <span class="candidate-photo p3">
                      DS
                    </span>

                    <b>
                      Data Science Intern
                      <small>
                        Internship · Remote
                      </small>
                    </b>
                  </td>

                  <td>32</td>
                  <td>6</td>

                  <td>
                    <i class="status active">
                      ● Active
                    </i>
                  </td>

                  <td>20 Aug 2026</td>

                  <td>
                    <button class="row-btn">
                      View details
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>
                    <span class="candidate-photo p4">
                      FE
                    </span>

                    <b>
                      Frontend Developer
                      <small>
                        Full-time · Pune
                      </small>
                    </b>
                  </td>

                  <td>55</td>
                  <td>10</td>

                  <td>
                    <i class="status closed">
                      ● Closed
                    </i>
                  </td>

                  <td>10 Aug 2026</td>

                  <td>
                    <button class="row-btn">
                      View details
                    </button>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          <button
            class="portal-add"
            id="portalPostJob"
          >
            ＋ Post new opportunity
          </button>

        </section>


        <div class="portal-two">


          <section class="portal-panel compact-panel">

            <div class="portal-title">

              <h2>
                Top Applicants
                <small>(This month)</small>
              </h2>

              <a>
                View all →
              </a>

            </div>


            <ol class="top-applicants">

              <li>

                <b>1</b>

                <span class="candidate-photo p1">
                  SM
                </span>

                <div>
                  <strong>
                    Saptarshi Mukherjee
                  </strong>

                  <small>
                    AI/ML Intern
                  </small>
                </div>

                <em>
                  Top match
                </em>

                <i>
                  92%
                </i>

              </li>


              <li>

                <b>2</b>

                <span class="candidate-photo p2">
                  PS
                </span>

                <div>
                  <strong>
                    Priya Sharma
                  </strong>

                  <small>
                    Backend Developer
                  </small>
                </div>

                <em>
                  High match
                </em>

                <i>
                  88%
                </i>

              </li>


              <li>

                <b>3</b>

                <span class="candidate-photo p3">
                  AP
                </span>

                <div>
                  <strong>
                    Arjun Patel
                  </strong>

                  <small>
                    Data Science Intern
                  </small>
                </div>

                <em>
                  High match
                </em>

                <i>
                  85%
                </i>

              </li>


              <li>

                <b>4</b>

                <span class="candidate-photo p4">
                  NS
                </span>

                <div>
                  <strong>
                    Neha Singh
                  </strong>

                  <small>
                    Frontend Developer
                  </small>
                </div>

                <em>
                  Good match
                </em>

                <i>
                  78%
                </i>

              </li>

            </ol>

          </section>


          <section class="portal-panel compact-panel">

            <div class="portal-title">

              <h2>
                Repository Views
                <small>(By applicants)</small>
              </h2>

              <a>
                View all →
              </a>

            </div>


            <div class="repo-list">

              <div>

                <span class="candidate-photo p1">
                  SM
                </span>

                <p>
                  <b>
                    Saptarshi Mukherjee
                  </b>

                  <small>
                    viewed your repository
                  </small>
                </p>

                <em>
                  AI E-commerce system
                </em>

                <time>
                  3 hours ago
                </time>

              </div>


              <div>

                <span class="candidate-photo p2">
                  PS
                </span>

                <p>
                  <b>
                    Priya Sharma
                  </b>

                  <small>
                    viewed your repository
                  </small>
                </p>

                <em>
                  Waste Management
                </em>

                <time>
                  5 hours ago
                </time>

              </div>


              <div>

                <span class="candidate-photo p3">
                  AP
                </span>

                <p>
                  <b>
                    Arjun Patel
                  </b>

                  <small>
                    viewed your repository
                  </small>
                </p>

                <em>
                  Learning Platform
                </em>

                <time>
                  1 day ago
                </time>

              </div>

            </div>

          </section>

        </div>


        <section class="portal-panel analytics-panel">

          <div>

            <p>
              REPOSITORY ANALYTICS OVERVIEW
            </p>

            <div class="analytics-numbers">

              <span>
                <small>
                  Total repositories viewed
                </small>
                <b>892</b>
                <em>+27%</em>
              </span>

              <span>
                <small>
                  Unique applicants
                </small>
                <b>156</b>
                <em>+18%</em>
              </span>

              <span>
                <small>
                  Total views
                </small>
                <b>1,247</b>
                <em>+23%</em>
              </span>

              <span>
                <small>
                  Avg. time spent
                </small>
                <b>4m 32s</b>
                <em>+12%</em>
              </span>

            </div>

          </div>


          <div class="repo-bars">

            <small>
              Most viewed repositories
            </small>

            <p>
              AI E-commerce Recommendation
              <i style="width:94%"></i>
              <b>342</b>
            </p>

            <p>
              Waste Management System
              <i style="width:79%"></i>
              <b>298</b>
            </p>

            <p>
              Student Learning Platform
              <i style="width:62%"></i>
              <b>256</b>
            </p>

          </div>

        </section>

      </main>


      <aside class="portal-side">


        <section class="portal-panel company-panel">

          <div class="company-logo">
            T
          </div>

          <div>

            <h2>
              TechNova Solutions
            </h2>

            <a>
              ✓ Verified company
            </a>

          </div>

          <p>
            Building intelligent digital solutions for tomorrow.
          </p>


          <div class="company-info">

            <span>
              ⌖ Bangalore, India
            </span>

            <span>
              ◎ technova.com
            </span>

            <span>
              ♙ 251–500 Employees
            </span>

            <span>
              ◈ Software Development
            </span>

          </div>


          <button class="primary compact">
            ✎ Edit company profile
          </button>

        </section>


        <section class="portal-panel funnel-panel">

          <div class="portal-title">

            <h2>
              Application Funnel
            </h2>

            <button>
              This month⌄
            </button>

          </div>


          <div
            class="funnel"
            id="applicationFunnel"
          >

            <button
              data-stage="Total applicants"
              data-value="248"
              class="funnel-stage f1"
            >
              248
            </button>

            <button
              data-stage="Screened"
              data-value="132"
              class="funnel-stage f2"
            >
              132
            </button>

            <button
              data-stage="Shortlisted"
              data-value="38"
              class="funnel-stage f3"
            >
              38
            </button>

            <button
              data-stage="Interviews"
              data-value="15"
              class="funnel-stage f4"
            >
              15
            </button>

            <button
              data-stage="Offers"
              data-value="5"
              class="funnel-stage f5"
            >
              5
            </button>

          </div>


          <div
            class="funnel-detail"
            id="funnelDetail"
          >

            <b>248</b>

            <span>
              Total applicants
            </span>

            <small>
              Select a funnel stage to inspect it.
            </small>

          </div>


          <p class="conversion">
            Conversion rate:
            <b>2.0%</b>

            <em>
              ↗ +0.8% vs last month
            </em>
          </p>

        </section>


        <section class="portal-panel activity-panel">

          <div class="portal-title">

            <h2>
              Recent Activity
            </h2>

            <a>
              View all →
            </a>

          </div>


          <p>
            <i>♧</i>

            <span>
              <b>
                12 new applications for AI/ML Intern
              </b>

              <small>
                2 hours ago
              </small>
            </span>
          </p>


          <p>
            <i>◈</i>

            <span>
              <b>
                Saptarshi Mukherjee viewed repository
              </b>

              <small>
                3 hours ago
              </small>
            </span>
          </p>


          <p>
            <i>♙</i>

            <span>
              <b>
                5 candidates shortlisted for Backend Developer
              </b>

              <small>
                5 hours ago
              </small>
            </span>
          </p>


          <p>
            <i>◷</i>

            <span>
              <b>
                Interview scheduled with 3 candidates
              </b>

              <small>
                Yesterday
              </small>
            </span>
          </p>

        </section>

      </aside>

    </div>
  `;


  $('#portalPostJob').onclick=()=>
    $('#jobModal').classList.remove('hidden');


  document
    .querySelectorAll('.funnel-stage')
    .forEach(
      button=>
        button.onclick=()=>
          selectFunnelStage(button)
    );
}


function selectFunnelStage(button){

  document
    .querySelectorAll('.funnel-stage')
    .forEach(
      stage=>
        stage.classList.toggle(
          'selected',
          stage===button
        )
    );

  $('#funnelDetail').innerHTML=`

    <b>${button.dataset.value}</b>

    <span>
      ${button.dataset.stage}
    </span>

    <small>
      Click another stage to compare your pipeline.
    </small>

  `;
}


$('#headerPostJob')?.addEventListener(
  'click',
  ()=>{
    if(accountRole!=='recruiter') return;

    $('#jobModal')?.classList.remove('hidden');
  }
);


function updateRecruiterAccess(){

  const recruiter=accountRole==='recruiter';


  $('#openJob')?.classList.toggle(
    'hidden',
    !recruiter||!recruiterVerified
  );


  $('#recruiterGate')?.classList.toggle(
    'hidden',
    !recruiter||recruiterVerified
  );


  /*
    Recruiters do not create student projects
    or build student CVs.
  */

  $('#buildCV')?.classList.toggle(
    'hidden',
    recruiter
  );

  $('#openProject')?.classList.toggle(
    'hidden',
    recruiter
  );

  $('#openProject2')?.classList.toggle(
    'hidden',
    recruiter
  );

  $('#projectsNav')?.classList.toggle(
    'hidden',
    recruiter
  );

  $('#projects')?.classList.toggle(
    'hidden',
    recruiter
  );


  /*
    The recruiter header should expose
    only recruiter actions.
  */

  $('#headerPostJob')?.classList.toggle(
    'hidden',
    !recruiter
  );


  if(recruiter&&recruiterVerified){

    $('#opportunitySubtitle').textContent=
      'You are verified to publish trusted opportunities to matched candidates.';

  }

  else if(recruiter){

    $('#opportunitySubtitle').textContent=
      'Complete verification to publish opportunities to students.';

  }

  else{

    $('#opportunitySubtitle').textContent=
      'Matched to your verified skills, interests, and project categories.';

  }

}


function showApp(
  n='Aryan Mehta',
  role='student'
){

  $('#auth')?.classList.add('hidden');

  $('#app')?.classList.remove('hidden');

  accountRole=role;


  const initials=
    n
      .split(/\s+/)
      .filter(Boolean)
      .map(x=>x[0])
      .join('')
      .slice(0,2)
      .toUpperCase();


  const studentOverview=
    $('#studentOverview');

  const recruiterDashboard=
    $('#recruiterDashboard');


  /*
    Recruiter accounts must never render
    the student's GitHub activity,
    LeetCode skill map, or radar chart.
  */

  studentOverview?.classList.toggle(
    'hidden',
    role==='recruiter'
  );

  recruiterDashboard?.classList.toggle(
    'hidden',
    role!=='recruiter'
  );


  const profileName=$('#profileName');

  if(
    profileName &&
    profileName.childNodes[0]
  )
    profileName.childNodes[0].textContent=
      n+' ';


  if($('#sideName'))
    $('#sideName').textContent=n;


  if($('#greetingName'))
    $('#greetingName').textContent=
      role==='recruiter'
        ?'HIRING TEAM'
        :n.split(/\s+/)[0].toUpperCase();


  if($('#bigAvatar'))
    $('#bigAvatar').textContent=initials;


  document
    .querySelector('.profile-mini .avatar')
    ?.replaceChildren(
      document.createTextNode(initials)
    );


  const miniRole=
    document.querySelector('.profile-mini small');


  if(miniRole)
    miniRole.textContent=
      role==='recruiter'
        ?'Recruiter'
        :'Student';


  $('#overview')?.classList.toggle(
    'recruiter-mode',
    role==='recruiter'
  );


  /*
    Apply all recruiter/student
    visibility rules in one place.
  */

  updateRecruiterAccess();


  if(role==='recruiter')
    renderRecruiterPortal();


  renderProjects();

  renderOpps();


  /*
    Radar is only a student feature,
    so render it only when the
    student overview is visible.
  */

  if(role==='student')
    requestAnimationFrame(
      renderRadarChart
    );

}


$('#createID').onclick=()=>{

  let n=$('#name').value.trim();

  let e=$('#email').value.trim();

  let role=
    $('#role').value.includes('Recruiter')
      ?'recruiter'
      :'student';


  if(
    !n||
    !e||
    !e.includes('@')
  )
    return toast(
      'Add your name and a valid email to continue.'
    );


  let id=
    'KN-'+
    Math.floor(
      1000+
      Math.random()*9000
    );


  $('#kidValue').textContent=id;


  showApp(n,role);


  toast(
    `Your K.ID ${id} is ready.`
  );

};


$('#demoLogin').onclick=e=>{

  e.preventDefault();

  showApp();

};


document
  .querySelectorAll('[data-tab]')
  .forEach(e=>e.onclick=()=>{

    const id=e.dataset.tab;


    /*
      Recruiters cannot navigate back
      into the student Projects tab.
    */

    if(
      accountRole==='recruiter' &&
      id==='projects'
    )
      return;


    document
      .querySelectorAll('.tab-panel')
      .forEach(
        p=>p.classList.add('hidden')
      );


    $('#'+id)?.classList.remove(
      'hidden'
    );


    document
      .querySelectorAll('nav a')
      .forEach(
        a=>
          a.classList.toggle(
            'active',
            a.dataset.tab===id
          )
      );


    window.scrollTo({
      top:0,
      behavior:'smooth'
    });

});


$('#openProject').onclick=
$('#openProject2').onclick=()=>{

  if(accountRole==='recruiter')
    return;

  $('#modal').classList.remove(
    'hidden'
  );

};


$('#closeModal').onclick=()=>
  $('#modal').classList.add(
    'hidden'
  );


$('#saveProject').onclick=()=>{

  let n=
    $('#projectName').value.trim();

  let repo=
    $('#projectRepo').value.trim();


  if(!n)
    return toast(
      'Give your project a name first.'
    );


  projects.unshift({

    name:n,

    category:
      $('#projectCategory').value,

    visibility:
      $('#projectVisibility').value,

    repo:repo,

    desc:
      'A new project added to this proof-led portfolio.'

  });


  renderProjects();


  $('#modal').classList.add(
    'hidden'
  );


  $('#projectName').value='';

  $('#projectRepo').value='';


  toast(
    'Project added to your portfolio.'
  );

};


$('#openJob').onclick=()=>
  $('#jobModal').classList.remove(
    'hidden'
  );


$('#closeJobModal').onclick=()=>
  $('#jobModal').classList.add(
    'hidden'
  );


$('#saveJob').onclick=()=>{

  let title=
    $('#jobTitle').value.trim();

  let company=
    $('#jobCompany').value.trim();


  if(!title||!company)
    return toast(
      'Add a role title and organization.'
    );


  opportunities.unshift([

    company[0].toUpperCase(),

    company,

    title,

    `${$('#jobLocation').value} · ${$('#jobType').value}`,

    'New'

  ]);


  renderOpps();


  $('#jobModal').classList.add(
    'hidden'
  );


  $('#jobTitle').value='';

  $('#jobCompany').value='';


  toast(
    'Opportunity published for matched candidates.'
  );

};


$('#openVerify').onclick=()=>
  $('#verifyModal').classList.remove(
    'hidden'
  );


$('#closeVerifyModal').onclick=()=>
  $('#verifyModal').classList.add(
    'hidden'
  );


$('#verifyRecruiter').onclick=()=>{

  let company=
    $('#verifyCompany').value.trim();

  let hires=
    Number(
      $('#hireCount').value
    );


  if(
    !company||
    hires<100||
    !$('#attest').checked
  )
    return toast(
      'Confirm a recognized company, 100+ hires, and the attestation.'
    );


  recruiterVerified=true;


  $('#verifyModal').classList.add(
    'hidden'
  );


  updateRecruiterAccess();


  toast(
    'Verified recruiter badge granted. You can now post opportunities.'
  );

};


function cvHTML(){

  let name=
    $('#profileName')
      .childNodes[0]
      .textContent
      .trim();


  let projectList=
    projects
      .slice(0,4)
      .map(
        p=>
          `<li>
            <b>${p.name}</b>
            — ${p.desc}
            <em>(${p.category})</em>
          </li>`
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
  padding:0 25px
}

h1{
  font-size:30px;
  margin:0;
  color:#182033
}

h2{
  font-size:14px;
  text-transform:uppercase;
  letter-spacing:1.2px;
  color:#6041c9;
  border-bottom:1px solid #d9ddef;
  padding-bottom:5px;
  margin-top:24px
}

.meta{
  color:#667085;
  font-size:13px;
  margin:5px 0 15px
}

.tag{
  display:inline-block;
  background:#efebff;
  color:#543bb2;
  padding:3px 7px;
  border-radius:10px;
  font-size:11px;
  margin:3px
}

li{
  margin:7px 0
}

.stats{
  display:flex;
  gap:25px;
  background:#f5f6fb;
  padding:12px;
  border-radius:7px;
  font-size:12px
}

.stats b{
  display:block;
  font-size:17px;
  color:#5035aa
}

</style>

</head>


<body>

<h1>
  ${name}
</h1>


<p class="meta">
  Computer Science Student · Bengaluru, India ·
  ${accountRole==='recruiter'?'Recruiter':'Candidate'} ·
  K.ID ${$('#kidValue').textContent}
</p>


<h2>
  Profile
</h2>

<p>
  Proof-led developer with strengths in full-stack development,
  product thinking, and problem solving. Portfolio includes
  independently shipped work with linked technical evidence.
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
  <b>Meta Front-End Developer</b>
  — Coursera, May 2026
</li>

<li>
  <b>AWS Cloud Practitioner</b>
  — Amazon Web Services, February 2026
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

<span>
  <b>118 / 101 / 28</b>
  Easy / Medium / Hard
</span>

</div>


<h2>
  GitHub activity
</h2>

<p>
  12 repositories · 186 contributions in the last year ·
  14-day contribution streak
</p>


</body>

</html>

`;

}


function previewCV(){

  let source=cvHTML();

  let doc=
    new DOMParser()
      .parseFromString(
        source,
        'text/html'
      );


  $('#cvPreview').innerHTML=
    doc.body.innerHTML;

}


$('#buildCV').onclick=()=>{

  if(accountRole==='recruiter')
    return;

  previewCV();

  $('#cvModal').classList.remove(
    'hidden'
  );

};


$('#closeCVModal').onclick=()=>
  $('#cvModal').classList.add(
    'hidden'
  );


$('#downloadCV').onclick=()=>{

  let name=
    $('#profileName')
      .childNodes[0]
      .textContent
      .trim()
      .replace(
        /[^a-z0-9]/gi,
        '_'
      );


  let file=
    new Blob(
      [cvHTML()],
      {
        type:'application/msword'
      }
    );


  let url=
    URL.createObjectURL(file);


  let a=
    document.createElement('a');


  a.href=url;

  a.download=
    `${name}_Kaushala_CV.doc`;


  a.click();


  URL.revokeObjectURL(url);


  toast(
    'Your CV document is downloading.'
  );

};


$('#printCV').onclick=()=>{

  let win=
    window.open(
      '',
      '_blank'
    );


  if(!win)
    return toast(
      'Allow pop-ups to print your CV.'
    );


  win.document.write(
    cvHTML()
  );


  win.document.close();

  win.focus();


  setTimeout(
    ()=>win.print(),
    250
  );

};


/* =========================================================
   LEETCODE RADAR — interactive student-only chart
========================================================= */

const radarSkills=[

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


function radarPoint(index,score){

  const cx=180;

  const cy=105;

  const radius=80;

  const angle=
    -Math.PI/2+
    (
      index*
      (
        Math.PI*2/
        radarSkills.length
      )
    );


  const r=
    radius*
    (
      score/100
    );


  return {

    x:
      cx+
      Math.cos(angle)*r,

    y:
      cy+
      Math.sin(angle)*r

  };

}


function showRadarSkill(index){

  const skill=
    radarSkills[index];


  if(!skill)
    return;


  const insight=
    $('#radarInsight');


  if(insight)
    insight.textContent=
      `${skill.name} · ${skill.score} / 100`;


  document
    .querySelectorAll(
      '.radar-list button'
    )
    .forEach(
      (button,i)=>{
        button.classList.toggle(
          'active',
          i===index
        );
      }
    );


  document
    .querySelectorAll(
      '.radar-nodes circle'
    )
    .forEach(
      (node,i)=>{
        node.classList.toggle(
          'active',
          i===index
        );
      }
    );


  const node=
    document
      .querySelectorAll(
        '.radar-nodes circle'
      )[index];


  const wrap=
    $('.radar-wrap');


  if(!node||!wrap)
    return;


  let tooltip=
    $('#radarTooltip');


  if(!tooltip){

    tooltip=
      document.createElement(
        'div'
      );

    tooltip.id=
      'radarTooltip';

    tooltip.className=
      'radar-tooltip';

    wrap.appendChild(
      tooltip
    );

  }


  const nodeRect=
    node.getBoundingClientRect();


  const wrapRect=
    wrap.getBoundingClientRect();


  tooltip.innerHTML=`

    <b>
      ${skill.name}
    </b>

    <span>
      ${skill.score} / 100
    </span>

  `;


  tooltip.style.left=
    `${
      nodeRect.left-
      wrapRect.left+
      nodeRect.width/2
    }px`;


  tooltip.style.top=
    `${
      nodeRect.top-
      wrapRect.top-
      8
    }px`;


  tooltip.classList.add(
    'visible'
  );

}


function renderRadarChart(){

  const polygon=
    $('.radar-data');


  const nodes=
    document.querySelectorAll(
      '.radar-nodes circle'
    );


  if(
    !polygon||
    nodes.length!==radarSkills.length
  )
    return;


  polygon.setAttribute(

    'points',

    radarSkills
      .map(
        (skill,index)=>{

          const point=
            radarPoint(
              index,
              skill.score
            );


          return `
            ${point.x.toFixed(1)},
            ${point.y.toFixed(1)}
          `;

        }
      )
      .join(' ')

  );


  nodes.forEach(
    (node,index)=>{

      const point=
        radarPoint(
          index,
          radarSkills[index].score
        );


      node.setAttribute(
        'cx',
        point.x.toFixed(1)
      );


      node.setAttribute(
        'cy',
        point.y.toFixed(1)
      );


      node.dataset.skill=
        radarSkills[index].name;


      node.dataset.score=
        radarSkills[index].score;


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
        `${radarSkills[index].name}: ${radarSkills[index].score} out of 100`
      );


      node.onclick=
        ()=>showRadarSkill(index);


      node.onmouseenter=
        ()=>showRadarSkill(index);


      node.onfocus=
        ()=>showRadarSkill(index);


      node.onkeydown=e=>{

        if(
          e.key==='Enter'||
          e.key===' '
        ){

          e.preventDefault();

          showRadarSkill(index);

        }

      };

    }
  );


  document
    .querySelectorAll(
      '.radar-list button'
    )
    .forEach(
      (button,index)=>{

        button.onclick=
          ()=>showRadarSkill(index);

        button.onmouseenter=
          ()=>showRadarSkill(index);

        button.onfocus=
          ()=>showRadarSkill(index);

      }
    );


  showRadarSkill(0);

}


// The script is loaded at the end of <body>,
// but this also makes the chart safe if the
// file is moved into <head> later.

if(
  document.readyState==='loading'
){

  document.addEventListener(
    'DOMContentLoaded',
    renderRadarChart,
    {once:true}
  );

}

else{

  renderRadarChart();

}


/* ===== Natural GitHub contribution calendar ===== */

(() => {

  const months=[
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


  const shortMonths=[
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


  const state={
    view:'year',
    year:2026,
    month:8
  };


  const seed=(y,m,d)=>{

    const x=
      Math.sin(
        y*12.9898+
        m*78.233+
        d*37.719
      )*
      43758.5453;


    return x-
      Math.floor(x);

  };


  const isFuture=d=>{

    const now=
      new Date();


    now.setHours(
      23,
      59,
      59,
      999
    );


    return d>now;

  };


  const count=(y,m,d)=>{

    const w=
      new Date(
        y,
        m,
        d
      ).getDay();


    const a=
      seed(
        y,
        m+1,
        d
      );


    const b=
      seed(
        y+19,
        m+7,
        d+13
      );


    const chance=
      (
        w===0||
        w===6
      )
        ? .28
        : .43;


    if(a>chance)
      return 0;


    if(b<.50)
      return 1;


    if(b<.78)
      return 2;


    if(b<.93)
      return 3;


    if(b<.985)
      return 4;


    return 6;

  };


  const level=n=>
    n<=0
      ?0
      :n===1
        ?1
        :n===2
          ?2
          :n<=4
            ?3
            :4;


  const fmt=d=>
    d.toLocaleDateString(
      'en-IN',
      {
        day:'numeric',
        month:'short',
        year:'numeric'
      }
    );


  const yearDays=y=>{

    const out=[];


    for(
      let d=
        new Date(
          y,
          0,
          1
        );

      d<=
        new Date(
          y,
          11,
          31
        );

      d.setDate(
        d.getDate()+1
      )
    ){

      const x=
        new Date(d);


      out.push({

        date:x,

        count:
          isFuture(x)
            ?0
            :count(
              y,
              x.getMonth(),
              x.getDate()
            )

      });

    }


    return out;

  };


  const monthDays=(y,m)=>{

    const out=[];


    for(
      let d=1;

      d<=
        new Date(
          y,
          m+1,
          0
        ).getDate();

      d++
    ){

      const x=
        new Date(
          y,
          m,
          d
        );


      out.push({

        date:x,

        count:
          isFuture(x)
            ?0
            :count(
              y,
              m,
              d
            )

      });

    }


    return out;

  };


  const stats=days=>{

    let total=0;

    let run=0;

    let current=0;

    let best=0;


    days.forEach(
      x=>{

        total+=x.count;


        if(x.count){

          run++;

          best=
            Math.max(
              best,
              run
            );

        }

        else{

          run=0;

        }

      }
    );


    for(
      let i=
        days.length-1;

      i>=0&&days[i].count;

      i--
    )
      current++;


    return {
      total,
      current,
      best
    };

  };


  const hideTip=()=>
    document
      .querySelector(
        '#githubTooltip'
      )
      ?.classList.remove(
        'visible'
      );


  const showTip=b=>{

    const t=
      document.querySelector(
        '#githubTooltip'
      );


    const s=
      document.querySelector(
        '.github-heatmap-shell'
      );


    if(!t||!s)
      return;


    const r=
      b.getBoundingClientRect();


    const sr=
      s.getBoundingClientRect();


    const d=
      new Date(
        b.dataset.date
      );


    const n=
      Number(
        b.dataset.count
      );


    t.innerHTML=`

      <strong>
        ${n}
        contribution${n===1?'':'s'}
      </strong>

      <span>
        ${fmt(d)}
      </span>

    `;


    t.style.left=
      `${
        r.left-
        sr.left+
        r.width/2
      }px`;


    t.style.top=
      `${
        r.top-
        sr.top-
        7
      }px`;


    t.classList.add(
      'visible'
    );

  };


  const makeCell=item=>{

    const b=
      document.createElement(
        'button'
      );


    b.type='button';

    b.className=
      'github-day';


    if(!item){

      b.classList.add(
        'empty'
      );

      b.disabled=true;

      return b;

    }


    b.classList.add(
      'level-'+
      level(item.count)
    );


    b.dataset.count=
      item.count;


    b.dataset.date=
      item.date.toISOString();


    b.setAttribute(
      'aria-label',
      `${item.count} contribution${item.count===1?'':'s'} on ${fmt(item.date)}`
    );


    b.title=
      `${item.count} contribution${item.count===1?'':'s'} on ${fmt(item.date)}`;


    b.addEventListener(
      'mouseenter',
      ()=>showTip(b)
    );


    b.addEventListener(
      'focus',
      ()=>showTip(b)
    );


    b.addEventListener(
      'mouseleave',
      hideTip
    );


    b.addEventListener(
      'blur',
      hideTip
    );


    return b;

  };


  const render=()=>{

    const heat=
      document.querySelector(
        '#githubHeatmap'
      );


    const labels=
      document.querySelector(
        '#githubMonthLabels'
      );


    const ys=
      document.querySelector(
        '#githubYear'
      );


    const ms=
      document.querySelector(
        '#githubMonth'
      );


    const summary=
      document.querySelector(
        '#githubSummary'
      );


    const numbers=
      document.querySelector(
        '#githubNumbers'
      );


    if(
      !heat||
      !labels||
      !ys||
      !ms
    )
      return;


    state.year=
      Number(
        ys.value
      )||
      2026;


    state.month=
      Number(
        ms.value
      )||
      0;


    const isMonth=
      state.view==='month';


    ys.classList.remove(
      'hidden'
    );


    ms.classList.toggle(
      'hidden',
      !isMonth
    );


    document
      .querySelectorAll(
        '.github-view'
      )
      .forEach(
        b=>
          b.classList.toggle(
            'active',
            b.dataset.githubView===
              state.view
          )
      );


    const days=
      isMonth
        ?monthDays(
          state.year,
          state.month
        )
        :yearDays(
          state.year
        );


    heat.innerHTML='';

    labels.innerHTML='';


    if(isMonth){

      heat.className=
        'heatmap github-month-view';


      labels.className=
        'github-month-labels github-month-title';


      const title=
        document.createElement(
          'span'
        );


      title.textContent=
        `${months[state.month]} ${state.year}`;


      labels.appendChild(
        title
      );


      const off=
        days[0].date.getDay();


      const weeks=
        Math.ceil(
          (
            off+
            days.length
          )/7
        );


      heat.style.setProperty(
        '--github-weeks',
        weeks
      );


      for(
        let w=0;
        w<weeks;
        w++
      ){

        for(
          let r=0;
          r<7;
          r++
        ){

          const i=
            w*7+
            r-
            off;


          heat.appendChild(
            makeCell(
              days[i]||
              null
            )
          );

        }

      }

    }


    else{

      heat.className=
        'heatmap github-year-view';


      labels.className=
        'github-month-labels';


      const first=
        new Date(
          state.year,
          0,
          1
        );


      const off=
        first.getDay();


      const weeks=
        Math.ceil(
          (
            off+
            days.length
          )/7
        );


      heat.style.setProperty(
        '--github-weeks',
        weeks
      );


      labels.style.setProperty(
        '--github-weeks',
        weeks
      );


      for(
        let w=0;
        w<weeks;
        w++
      ){

        for(
          let r=0;
          r<7;
          r++
        ){

          const i=
            w*7+
            r-
            off;


          heat.appendChild(
            makeCell(
              days[i]||
              null
            )
          );

        }

      }


      let last=-2;


      for(
        let m=0;
        m<12;
        m++
      ){

        const date=
          new Date(
            state.year,
            m,
            1
          );


        const col=
          Math.floor(
            (
              Math.floor(
                (
                  date-
                  first
                )/
                86400000
              )+
              off
            )/7
          );


        if(
          col<=last+1
        )
          continue;


        const l=
          document.createElement(
            'span'
          );


        l.textContent=
          shortMonths[m];


        l.style.gridColumn=
          col+1;


        labels.appendChild(
          l
        );


        last=col;

      }

    }


    const st=
      stats(days);


    if(summary)
      summary.textContent=
        `${st.total} contributions in ${
          isMonth
            ?months[state.month]+' '
            :''
        }${state.year}`;


    if(numbers)
      numbers.innerHTML=`

        <span>
          <b>12</b>
          repositories
        </span>

        <span>
          <b>${st.total}</b>
          contributions
        </span>

        <span>
          <b>${st.current}</b>
          day streak
        </span>

      `;

  };


  document
    .querySelectorAll(
      '.github-view'
    )
    .forEach(
      b=>
        b.addEventListener(
          'click',
          ()=>{
            state.view=
              b.dataset.githubView===
              'month'
                ?'month'
                :'year';

            render();

          }
        )
    );


  document
    .querySelector(
      '#githubYear'
    )
    ?.addEventListener(
      'change',
      render
    );


  document
    .querySelector(
      '#githubMonth'
    )
    ?.addEventListener(
      'change',
      render
    );


  render();

})();


/* =========================================================
   LIGHT / DARK MODE
   ========================================================= */

(() => {

  const root = document.documentElement;

  /*
    Get saved theme.
    If nothing is saved, follow the system preference.
  */
  const savedTheme = localStorage.getItem('kaushala-theme');

  const systemDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme =
    savedTheme ||
    (systemDark ? 'dark' : 'light');


  /*
    Apply theme to the entire document.
  */
  function applyTheme(theme) {

    currentTheme = theme;

    root.setAttribute(
      'data-theme',
      theme
    );


    /*
      Find the button every time instead of
      storing the element once.

      This makes it work even if the header
      is recreated dynamically.
    */
    const toggle =
      document.querySelector('#themeToggle');


    if (!toggle) return;


    const icon =
      toggle.querySelector('.theme-icon');

    const label =
      toggle.querySelector('.theme-label');


    const isDark =
      theme === 'dark';


    if (icon) {

      icon.textContent =
        isDark ? '☀' : '☾';

    }


    if (label) {

      label.textContent =
        isDark ? 'Light' : 'Dark';

    }


    toggle.setAttribute(
      'aria-label',
      isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode'
    );


    toggle.setAttribute(
      'title',
      isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode'
    );


    toggle.setAttribute(
      'aria-pressed',
      isDark ? 'true' : 'false'
    );

  }


  /*
    Apply saved/system theme immediately.
  */
  applyTheme(currentTheme);


  /*
    IMPORTANT:
    Use document-level event delegation.

    Instead of:
      toggle.addEventListener(...)

    we listen on document and check whether
    the clicked element belongs to #themeToggle.

    This prevents the button from becoming
    disconnected if the header is re-rendered.
  */
  document.addEventListener(
    'click',
    function (event) {

      const button =
        event.target.closest('#themeToggle');


      if (!button) return;


      event.preventDefault();

      event.stopPropagation();


      const nextTheme =
        currentTheme === 'dark'
          ? 'light'
          : 'dark';


      applyTheme(nextTheme);


      /*
        Remember user's choice.
      */
      localStorage.setItem(
        'kaushala-theme',
        nextTheme
      );

    },
    true
  );


  /*
    If the user has NOT manually selected
    a theme, react to operating-system
    theme changes.
  */
  if (window.matchMedia) {

    const media =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      );


    media.addEventListener?.(
      'change',
      event => {

        /*
          Don't override a manually saved
          user preference.
        */
        if (
          localStorage.getItem(
            'kaushala-theme'
          )
        ) {
          return;
        }


        applyTheme(
          event.matches
            ? 'dark'
            : 'light'
        );

      }
    );

  }

})();