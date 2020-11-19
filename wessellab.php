<?php

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");

    // Extract variables
    $project_name = $_POST['project_name'];
    $is_training = $_POST['is_training'];
    $trialseq = $_POST['trialseq'];
    $subject_number = $_POST['subject_number'];

    // Work our way through directories and make them if we need to
    $cwd = getcwd();

    // Data root
    $data_path = $cwd . '/data';
    if(!is_dir($data_path)) {
        mkdir($data_path);
    }

    // Project root
    $project_root = $data_path . '/' . $project_name;
    if(!is_dir($project_root)) {
        mkdir($project_root);
    }

    // Training vs. Full experiment
    $project_data = $project_root . ($is_training ? '/training' : '/exp');
    if(!is_dir($project_data)) {
        mkdir($project_data);
    }

    // Build full path to file we're writing to
    $fullfile = $project_data . '/' . $subject_number . '.json';
    
    $file = fopen($fullfile, 'w');
    fwrite($file, json_encode($trialseq));
    fclose($file);

    echo json_encode([
        'status' => 200
    ]);