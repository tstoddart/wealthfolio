//! The daily return series is built only when the caller asks for it (history
//! responses); summaries skip it, as the legacy summaries did.
#![allow(clippy::unwrap_used, clippy::panic, reason = "test code")]

mod support;

use support::*;
use wealthfolio_portfolio_engine::model::*;
use wealthfolio_portfolio_engine::{measure_account, measure_scope, MeasureProfile, Window};

#[test]
fn only_history_requests_build_the_return_series() {
    let scenario = load_all_scenarios()
        .into_iter()
        .find(|s| s.id == "NOM-MIX-01")
        .expect("NOM-MIX-01 scenario");
    let pipeline = Pipeline::from_scenario(&scenario);
    let lots = pipeline.lots();
    let inputs = pipeline.measure_inputs(&lots);
    let transactions = pipeline
        .facts()
        .accounts()
        .values()
        .find(|a| !a.archived && a.tracking != TrackingMode::Holdings)
        .expect("a transactions account")
        .id
        .clone();

    let measure = |series: bool| {
        measure_account(
            &inputs,
            &transactions,
            Window::default(),
            MeasureProfile::Full,
            series,
        )
        .unwrap()
    };
    let (history, summary) = (measure(true), measure(false));
    assert!(!history.series.is_empty());
    assert!(summary.series.is_empty());
    assert_eq!(summary.returns, history.returns);

    // An all-time mixed scope has no series; only a series request says so.
    let scope = pipeline.portfolio_scope();
    let measure = |series: bool| {
        measure_scope(
            &inputs,
            "portfolio",
            &scope,
            Window::default(),
            MeasureProfile::Full,
            series,
        )
        .unwrap()
    };
    let (history, summary) = (measure(true), measure(false));
    assert!(history
        .data_quality
        .warnings
        .contains(&QualityNote::MixedSeriesUnavailable));
    assert!(!summary
        .data_quality
        .warnings
        .contains(&QualityNote::MixedSeriesUnavailable));
    assert_eq!(summary.returns, history.returns);
}

#[test]
fn modified_dietz_profile_computes_stepped_series_and_returns() {
    let scenario = load_all_scenarios()
        .into_iter()
        .find(|s| s.id == "NOM-MIX-01")
        .expect("NOM-MIX-01 scenario");
    let pipeline = Pipeline::from_scenario(&scenario);
    let lots = pipeline.lots();
    let inputs = pipeline.measure_inputs(&lots);
    let transactions = pipeline
        .facts()
        .accounts()
        .values()
        .find(|a| !a.archived && a.tracking != TrackingMode::Holdings)
        .expect("a transactions account")
        .id
        .clone();

    let res = measure_account(
        &inputs,
        &transactions,
        Window::default(),
        MeasureProfile::Dietz,
        true,
    )
    .unwrap();

    assert_eq!(res.method, ReturnMethod::ModifiedDietz);
    assert!(res.returns.modified_dietz.is_some());
    assert_eq!(res.summary.method, ReturnMethod::ModifiedDietz);
    assert_eq!(res.summary.percent, res.returns.modified_dietz);
    assert!(!res.series.is_empty());
    let last_series_val = res.series.last().unwrap().value;
    assert_eq!(Some(last_series_val), res.returns.modified_dietz);
}
