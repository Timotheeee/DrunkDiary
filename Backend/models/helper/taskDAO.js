'use strict';
const Task = require("../../models/tasks.model");
const tasks = [
    {
        answers: [
            '{name} is your new president. All other players drink {n(1,3)} and call him/her Mr. Trump until the next game. ',
            'Sadly this is only a game and {name} needs to drink {n(2,3)}.'
        ],
        A: [''],
        B: [''],

        title: 'Next President',
        type: 'voteForPlayer',
        description: 'Everyone does a candidate speech! After that, you can vote for your next president.',
        options: { A: '', B: '', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: [
            "{name} already take[s/] enough drugs, don't drink but share {n(2,3)}."
        ],
        B: [
            "{name}, you fascists don't deserve to live, so drink {n(2,8)}. ",
            " We don't state your name but you gain {p(3,4)}, you dumbass, the police are grateful."
        ],

        title: 'legal vs illegal?',
        type: 'A or B',
        description: 'Should MDMA be {A} or {B}?',
        options: { A: 'legalized', B: 'stay criminalized', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: [
            "Cool kids don't do math, so therefore {name} need[s/] to drink {n(1,3)}."
        ],
        B: ['Since no one was right, all get {p(2,4)} !'],

        title: 'Math problem',
        type: 'MultyChoice',
        description: "What's 10/2*(2+3)=?",
        options: { A: 'no', B: '25', C: '1', D: '15' },
        solution: 'B',

    },
    {
        answers: [''],
        A: ['{name} were right! They get {p(2,3)} !'],
        B: ['Since no one was right, all drink {n(2,3)}.'],

        title: 'Geography',
        type: 'MultyChoice',
        description: 'What is the capital of Ghana?',
        options: { A: 'Kumasi', B: 'Accra', C: 'Cape Coast', D: 'Kinshasa' },
        solution: 'B',

    },
    {
        answers: [''],
        A: ['Why does {name} know that? Drink {n(2,2)}!'],
        B: ['Since no one was right, all get {p(2,3)}.'],

        title: 'Public figure',
        type: 'MultyChoice',
        description: 'What is the middle name of Angela Merkel?',
        options: {
            A: 'Dorothea',
            B: 'Elisabeth',
            C: "She doesn't have one.",
            D: 'Vanessa'
        },
        solution: 'A',

    },
    {
        answers: [''],
        A: ["Batman can't even fly, {name} has to drink {n(1,2)}."],
        B: ['Superman can at least fly, {name} gain[s/] {p(2,3)} !'],

        title: 'Superhero',
        type: 'A or B',
        description: 'Who would you rather be {A} or {B}?',
        options: { A: 'Batman', B: 'Superman', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: ['Please watch better movies, {name} has to drink {n(2,3)}.'],
        B: [
            "Real film connoisseurs know about Shrek's excellency, {name} gain[s/] {p(3,4)}."
        ],

        title: 'Movies',
        type: 'A or B',
        description: 'Would you rather watch {A} or {B}?',
        options: { A: 'Avengers: Infinity War', B: 'Shrek', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: [
            '{name} [is a sick bastard/are sick bastards], drink {n(3,5)}. Chinchillas are social animals. ',
            'Animal protection law 455.1 article 19 paragraph 1 says it is not legal to own just one. {name} need[s/] to keep 1m distance from all other players.'
        ],
        B: [
            'You are kind hearted, {name} gain[s/] {p(3,4)}. ',
            'Education may be useful from time to time, {name} receive[s/] {p(2,4)}.'
        ],

        title: 'Swiss law',
        type: 'A or B',
        description: 'Is it legal to just own one just one chinchilla?',
        options: { A: 'Yes', B: 'No', C: '', D: '' },
        solution: 'B',

    },
    {
        answers: [
            "Since {name} has so much fun, he should read out his last flirt on WhatsApp and while doing so he should take a sip anytime he thinks it's cringe.",
            'Since {name} can seduce everybody anyway, he can kiss someone of his choice and if that person refuses, [he] drinks {n(3,6)}.',
            'Since {name} should test himself for STD, we give him {p(2,5)} out of pity.',
            '{name}, being that kind of person aint a good thing, you should drink {n(2,4)} and reflect. '
        ],
        A: [''],
        B: [''],
        title: 'Fuck Boi',
        type: 'voteForPlayer',
        description: 'Who is the most attractive man in your group?',
        options: { A: '', B: '', C: '', D: '' },
        solution: 'A',
    },
    {
        answers: [''],
        A: [
            'Lucky guess, {name} gain[s/] {p(1,3)}. ',
            'Why would you {name}, even know that?!? Drink {n(2,5)}, to forget it.'
        ],
        B: [
            'Nobody seems to know, and that is good. {name} receive {p(1,1)} point. ',
            'Larry was the way to go, everybody who tweeted today shall drink {n(2,4)}.'
        ],

        title: 'Twitter ',
        type: 'MultyChoice',
        description: 'What is the name of the Twitter bird?',
        options: { A: 'Coco', B: 'Jerry', C: 'Rio', D: 'Larry' },
        solution: 'D',

    },
    {
        answers: [
            'From a scale of 1 to 10 {name} gains {p(1,9)}, for her beautiful body.',
            'Females always are right, so everyone except {name} needs to drink {n(1,4)}.',
            'A strong, independent woman like {name} has the courage to be the best version of herself, so be strong and drink {n(2,4)}.',
            "Why is it so hard for men to make eye contact with a woman?...Boobs don't have eyes. so {name} give as double the sips of your cup size, A=2, B=4...\n"
        ],
        A: [''],
        B: [''],

        title: 'Female',
        type: 'voteForPlayer',
        description: 'Pick the most feminin player.',
        options: { A: '', B: '', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: [
            'According to the bible (Genesis 1:20 - 22) the chicken came before the egg. {name} gain[s/] {p(1,4)}. ',
            'There is no correct answer due to different beliefs. Take {n(2,3)} and enjoy the comradeship.'
        ],
        B: [
            'If you look into the history of the earth, you will realize dinosaurs laid eggs. {name} drink {n(2,4)}. ',
            'There is no correct answer due to different beliefs. Take {n(2,3)} and enjoy the comradeship.'
        ],

        title: 'Chicken or Egg',
        type: 'A or B',
        description: 'What came first? The chicken or the egg?',
        options: { A: 'Chicken', B: 'Egg', C: '', D: '' },
        solution: 'A',

    },
    {
        answers: [''],
        A: [
            '{name} were right! How about a career in medicine? They get {p(2,3)} !'
        ],
        B: ['I hope none of you are studying medicine..., all drink {n(1,2)}!'],

        title: 'Virus Party',
        type: 'MultyChoice',
        description: 'Which of these is a virus?',
        options: {
            A: 'Staphylococcus',
            B: 'Leukemia',
            C: 'Scoliosis',
            D: 'Chicken pox'
        },
        solution: 'D',

    }
];

class TaskDAO {
    constructor() {
        this.updateTasks();
        setInterval(() => this.updateTasks(), 1000 * 60 * 60 * 24);
    }

    getTask() {

        let id = Math.floor(Math.random() * this.tasks.length);
        return this.tasks[id];

    }


    

    async updateTasks() {
        let tasks = await Task.find();
        let date = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log("--------------------------------------------- Running task update ----------------------------------------------");
        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log("--------------------------------------------------- " + date + " -------------------------------------------------");
        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log(tasks);
        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log("---------------------------------------------- End of task update ----------------------------------------------");
        console.log("----------------------------------------------------------------------------------------------------------------");
        this.tasks = tasks;
    }
}
module.exports = TaskDAO;
