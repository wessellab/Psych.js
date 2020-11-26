# Api Client

Client used for saving demographic and trialsequence data to the server.

#### Initialization
```

const demographics = await Psych.demographics();

const subject_number = 123456;
const project_name = 'Psych.js';
const trialseq = new Matrix(5, 5, 5);

var client = new ApiClient(subject_number, project_name, demographics, trialseq);

```

#### `await client.save(is_training)`

Save trialsequence data to the server.

Any time the `.save()` method is called, the demographic information will be resaved to the server by the client.

`is_training` is set to `false` by default, meaning that by default it assumes you are running the full experiment.

```

(async () => {
    
    const subject_number = 123456;
    const project_name = 'Psych.js';
    const trialseq = new Matrix(5, 5, 5);
    
    var client = new ApiClient(subject_number, project_name, trialseq);
    
    // Save data to the exp (full experiment) directory
    await client.save();

    // or
    await client.save(false);
    
    // Save data to training directory
    await client.save(true);
    
})();

```